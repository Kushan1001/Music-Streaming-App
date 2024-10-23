from flask import current_app as app, render_template, jsonify, request, send_file
from .security import user_datastore
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
from .model import db
import os
from mutagen.mp3 import MP3
from datetime import date
import flask_excel as excel
from .model import Songs, Albums, SongRating, User, Playlist, Role, FlagSong, DeletedInfo
import matplotlib
matplotlib.use('agg')
import matplotlib.pyplot as plt
import seaborn as sns
from .tasks import creator_details_csv
from celery.result import AsyncResult
import re


#---------------------------------------------------------------------------------------------
### methods

def avg_song_rating(song_id):
    ratings = []
    song = Songs.query.get(song_id)

    if SongRating.query.filter_by(song_id = song_id).first():
        song_ratings_obj = song.song_ratings

        for song_ratings in song_ratings_obj:
            ratings.append(song_ratings.rating)
        
        avg_rating = round(sum(ratings)/len(ratings), 2)
        return avg_rating
    else:
        return song.song_rating


def avg_creator_rating(creator_id):
    ratings = []
    songs = Songs.query.filter_by(creator_id = creator_id).all()

    for song in songs:
        if avg_song_rating(song.song_id) != 'Not Rated':
            ratings.append(avg_song_rating(song.song_id))

    if ratings != []:
        return round(sum(ratings)/len(ratings), 2)   
    else:
        return "Not Rated"
    
    
def avg_album_rating(album_id):
    ratings = []
    songs = Songs.query.filter_by(album_id = album_id).all()

    for song in songs:
        if avg_song_rating(song.song_id) != 'Not Rated':
            ratings.append(avg_song_rating(song.song_id))
    
    if ratings != []:
        return round(sum(ratings)/len(ratings), 2)
    else:
        return 'Not Rated'
    

def increase_counter(song_id):
    song_obj = Songs.query.get(song_id)
    song_obj.counter += 1
    return song_obj

#---------------------------------------------------------------------------------------------



@app.get('/')
def homepage():
    return render_template('index.html')
#---------------------------------------------------------------------------------------------


@app.post('/signin')
def signin():
    data = request.get_json()
    email_id = data.get('email_id')
    role = data.get('role')
    role_obj = Role.query.filter_by(name = role).first()

    if not email_id:
        return jsonify({"message": "Email ID not provided"}), 400
    
    user = user_datastore.find_user(email_id=email_id)

    if not user:
        return jsonify({"message": "User not found"}), 404
    
    if check_password_hash(user.password, data.get('password')) and  role_obj in user.roles:
        return jsonify({
            "message": "User Authenticated",
            "user_id": user.user_id,
            "token": user.get_auth_token(),
            "username": user.user_name,
            "email": user.email_id,
            "role": role_obj.name
        }), 200
    elif check_password_hash(user.password, data.get('password')) and role not in user.roles:
        return jsonify({"message": "You do not have access for the role selected"}), 400
    else: 
        return jsonify({"message": "Incorrect Password"}),400
#---------------------------------------------------------------------------------------------
### views    


@app.post('/signup')
def signup():
    data = request.get_json()
    details_empty = False

    if data.get('email_id'):
        if re.search('^.*@.*\.com$', data.get('email_id')):
            email_id = data.get('email_id')
        else:
            return jsonify({"message": "Please eneter a valid Email Id"}), 400
    else:
        details_empty = True
        return jsonify({"message": "Email ID cannot be empty"}), 404
       
    if data.get('password'):
        password = data.get('password')
    else:
        details_empty = True
        return jsonify({"message": "Password cannot be empty"}), 404
       
    if data.get('username'):
        username = data.get('username')
    else:
        details_empty = True
        return jsonify({"message": "Username cannot be empty"}), 404
      
    if data.get('first_name'):
        first_name = data.get('first_name')
    else:
        details_empty = True
        return jsonify({"message": "First Name cannot be empty"}), 404
    
    last_name = data.get('last_name')
    role = data.get('role')

    if details_empty == False:
        existing_user = user_datastore.find_user(email_id=email_id)
        if not existing_user:
            user_datastore.create_user(email_id = email_id, password = generate_password_hash(password), 
                                              user_name=username, f_name=first_name, l_name=last_name, roles=[role])
            db.session.commit()
            return jsonify({"message": "User created succesfully"}), 200
        
        if Role.query.filter_by(name = role).first() not in existing_user.roles:
            existing_user.roles.append(Role.query.filter_by(name = role).first())
            db.session.commit()
            return jsonify({"message": "Role added successfully"}), 200
        else:
            return jsonify({"message": "User exists with the given role"}), 400
#---------------------------------------------------------------------------------------------



@app.post('/set_visit_status')
def visit_status():
    data = request.get_json()
    user_id = int(data.get('user_id'))
    user_obj = User.query.get(user_id)

    if user_obj:
        user_obj.visited = "Yes"
        db.session.add(user_obj)
        db.session.commit()
        return jsonify({"message": "User has visited the app"}), 200
    else:
        return jsonify({"message": "No user assocaited with the user ID provided"}), 404
#---------------------------------------------------------------------------------------------



@app.post('/upload_song')
def upload_song():
    details_empty = False

    song_name = request.form.get('song_name').lower()
    creator_id = request.form.get('creator_id')
    existing_song = Songs.query.filter_by(song_name=song_name, creator_id=creator_id).first()

    if not existing_song:
        if request.form.get('song_name') != '':
            song_name = request.form.get('song_name').lower()
        else:
            return jsonify({"message": "Song Name cannot be empty"}), 404

        if request.form.get('album_id') != '' and  request.form.get('album_id') != 'undefined':
            album_id = request.form.get('album_id')
        else:
            return jsonify({"message": "Album Id cannot be empty.Please create an album first"}), 404

        if request.form.get('creator_id') != '' :
            creator_id = request.form.get('creator_id')
        else:
            return jsonify({"message": "Creator Id cannot be empty"}), 404

        if request.form.get('genre') != '':
            if (',' not in request.form.get('genre')) and (' ' not in request.form.get('genre')): 
                genre = request.form.get('genre').lower()
            else:
                return jsonify({"message":"Song can belong to only one genre"}), 400
        else:
            return jsonify({"message": "Genre cannot be empty"}), 404
        

        if request.files.get('mp3_file') is not None:
            mp3_file = request.files['mp3_file'] 
            mp3_filename = secure_filename(mp3_file.filename)
            if not mp3_filename.endswith('.mp3'):
                return jsonify({"message": "Only Mp3 files allowed for songs"}), 400
            else:
                mp3_filepath = os.path.join('static/uploads', mp3_filename)
                if os.path.exists(mp3_filepath):
                    return jsonify({"message": "Mp3 is aleady uploaded"}), 409
                else:
                    mp3_file.save(mp3_filepath)
                    audio = MP3(mp3_file)
                    song_duration = round(audio.info.length, 2)
        else:
            return jsonify({"message": "MP3 File cannot be empty"}), 404
        
        
        if request.files.get('lyrics_file') is not None:
            lyrics_file = request.files['lyrics_file']
            lyrics_filename = secure_filename(lyrics_file.filename)
            if not lyrics_filename.endswith('txt'):
                return jsonify({"message": "Only txt files allowed for lyrics"}), 400
            else:
                lyrics_filepath = os.path.join('static/uploads', lyrics_filename)
                if os.path.exists(lyrics_filepath):
                    return jsonify({"message": "txt file already uploaded"}), 409
                else:
                    lyrics_file.save(lyrics_filepath)
        else:
             return jsonify({"message": "Lyrics File cannot be empty"}), 404
           
        if details_empty == False:
            month = date.today().month

            with open(lyrics_filepath, 'r', encoding='utf-8') as lyrics_file:
                lyrics = lyrics_file.read()

            songs_obj = Songs(song_name = song_name, creator_id= creator_id, album_id=album_id, release_date = date.today(), 
                month=month, duration = song_duration ,genre=genre, mp3_file = mp3_filename, lyrics= lyrics)
            db.session.add(songs_obj)
            db.session.commit()
            return jsonify({"message": "Song Uploaded Successfully"}), 200
    else:
        return jsonify({"message": "Song already uploaded by the creator"}), 400
#---------------------------------------------------------------------------------------------



@app.post('/create_album')
def create_album():
    data = request.get_json()
    details_empty =  False

    if data.get("user_id"):
        creator_id = data.get("user_id")
    else:
        details_empty = True
        return jsonify({"message":"Creator ID cannot be empty"}), 404

    if data.get('album_name'):
        album_name = data.get('album_name').lower()
    else:
        details_empty = True
        return jsonify({"message":"Album Name cannot be empty"}), 404

    if details_empty == False:
        month = date.today().month
        existing_album = Albums.query.filter_by(album_name=album_name, creator_id=creator_id).first()
        if not existing_album:
            albums_obj = Albums(album_name=album_name, creator_id=creator_id, month=month)
            db.session.add(albums_obj)
            db.session.commit()
            return jsonify({"message": "Album sucessfully created"}), 200
        else:
            return jsonify({'message': "Album already created by the user"}), 400
#---------------------------------------------------------------------------------------------



@app.post('/select_album')
def select_album():
    data = request.get_json()

    if data.get('user_id'):
        creator_id = int(data.get('user_id'))
        if Albums.query.filter_by(creator_id = creator_id).first():
            all_albums = Albums.query.filter_by(creator_id = creator_id).all()
            album_json = [{
                "album_id": album.album_id,
                "album_name": album.album_name,
                } for album in all_albums]
            
            return jsonify({"data": album_json}), 200
        
        else:  return jsonify({"message": "No albums available for the given creator ID"}), 404   
    else:
        return jsonify({"message": "Please provide a valid creator ID"}), 400
#---------------------------------------------------------------------------------------------

    

@app.post("/creator_songs")
def creator_songs():
    data = request.get_json()

    if data.get('user_id'):
        creator_id = data.get('user_id')
        if Songs.query.filter_by(creator_id= creator_id).first():
            all_songs = Songs.query.filter_by(creator_id= creator_id).all()
            songs_json = [{
                "song_id": song.song_id,
                "song_name": song.song_name,
                "album_name":Albums.query.get(song.album_id).album_name,
                "genre": song.genre,
                "release_date": song.release_date,
                "duration": song.duration,
                "rating": avg_song_rating(song.song_id),
                "counter": song.counter,
                "flagged": len(FlagSong.query.filter_by(song_id = song.song_id, flagged = 'Yes').all())
            } for song in all_songs]  

            return jsonify({"data": songs_json}), 200
        
        else:
            return jsonify({"message": "No songs available for the given creator ID"}), 404        
    else:
        return jsonify({"message": "Please provide a valid creator ID"}), 400
#---------------------------------------------------------------------------------------------
    


@app.post("/get_song_details")
def get_song_details():
    data = request.get_json()

    if data.get('song_id'):
        song_id = int(data.get('song_id'))
        song_obj = Songs.query.get(song_id)

        return jsonify({
            "song_name": song_obj.song_name,
            "mp3_file": song_obj.mp3_file,
            "lyrics": song_obj.lyrics,
        }), 200
    
    else:
        return jsonify({"message": "Please provide a valid song ID"}), 404
#---------------------------------------------------------------------------------------------
    

    
@app.post("/creator_albums")
def creator_albums():
    data = request.get_json()

    if data.get('user_id'):
        creator_id = data.get('user_id')
        if Albums.query.filter_by(creator_id= creator_id).first():
            all_albums = Albums.query.filter_by(creator_id= creator_id).all()
            albums_json = [{
                "album_id": album.album_id,
                "album_name": album.album_name,
            } for album in all_albums]  

            return jsonify({"data": albums_json}), 200
        
        else:
            return jsonify({"message": "No albums available for the given creator ID"}), 404        
    else:
        return jsonify({"message": "Please provide a valid creator ID"}), 400
#---------------------------------------------------------------------------------------------



@app.post("/album_song_details")
def creator_album_song_details():
    data = request.get_json()

    if data.get('album_id'):
        album_id = int(data.get('album_id'))
        
        if Songs.query.filter_by(album_id= album_id).first():
            album_songs = Songs.query.filter_by(album_id= album_id).all()
            album_songs_json = [
                {"song_id": song.song_id,
                "album_name": Albums.query.get(album_id).album_name,
                "album_id": song.album_id,
                "song_name": song.song_name,
                "genre": song.genre,
                "release_date": song.release_date,
                "duration": song.duration,
                "rating": avg_song_rating(song.song_id),
                "counter": song.counter,
                "flagged": len(FlagSong.query.filter_by(song_id = song.song_id, flagged = 'Yes').all())}
                for song in album_songs]       
            return jsonify({"data": album_songs_json}), 200
        else:
            return jsonify({"message": "No song uploaded to the album"}), 404        
    else: 
        return jsonify({"message": "Please provide a valid album ID"}), 400
#---------------------------------------------------------------------------------------------


@app.post("/creator_details")
def creator_details():
    data = request.get_json()

    if data.get("user_id"):
        creator_id = int(data.get("user_id"))
        songs_uploaded = Songs.query.filter_by(creator_id = creator_id).all()
        albums_uploaded = Albums.query.filter_by(creator_id = creator_id).all()
        flagged_songs = 0
        creator_rating = avg_creator_rating(creator_id)

        for song in Songs.query.filter_by(creator_id = creator_id):
            if FlagSong.query.filter_by(song_id = song.song_id).first():
                if FlagSong.query.filter_by(song_id = song.song_id, flagged = 'Yes').first():
                    flagged_songs += 1

        most_streamed_song = ''
        most_streamed_song_counter = 0
        for song in songs_uploaded:
            if song.counter > most_streamed_song_counter:
                most_streamed_song_counter = song.counter
                most_streamed_song = song.song_name
        
        if most_streamed_song == '':
            most_streamed_song = 'Info not available'

        highest_rated_song = ''
        highest_rating = 0
        for song in songs_uploaded:
            if avg_song_rating(song.song_id) != 'Not Rated':
                if avg_song_rating(song.song_id) > highest_rating:
                    highest_rating = avg_song_rating(song.song_id)
                    highest_rated_song = song.song_name
        
        if highest_rated_song == '':
             highest_rated_song = 'Info not available'


        return jsonify({
            "songs_uploaded": len(songs_uploaded),
            "albums_uploaded": len(albums_uploaded),
            "flagged_songs": flagged_songs,
            "creator_rating": creator_rating,
            "most_streamed_song": most_streamed_song,
            "highest_rated_song": highest_rated_song
        }), 200
    else:
        return jsonify({"message": "Please provide a valid user ID"}), 400
    
#---------------------------------------------------------------------------------------------
    

@app.post('/edit_song')
def edit_song():
    song_id = int(request.form.get('song_id'))
    song_obj = Songs.query.get(song_id)
    updated = False
    
    song_name = request.form.get('updated_song_name').lower()
    creator_id = int(request.form.get('creator_id'))
    existing_song = Songs.query.filter_by(song_name=song_name, creator_id=creator_id).first()

    if not existing_song:
        if request.form.get('updated_song_name') != '':
            song_obj.song_name = request.form.get('updated_song_name').strip().lower()
            updated = True

        if request.form.get('updated_song_genre') != '':
            if (',' not in request.form.get('updated_song_genre')) and (' ' not in request.form.get('updated_song_genre')): 
                song_obj.genre = request.form.get('updated_song_genre').lower()
                updated = True
            else:
                return jsonify({"message":"Song can belong to only one genre"}), 400 

        if request.form.get('updated_song_lyrics'):
            song_obj.lyrics = request.form.get('updated_song_lyrics')
            updated = True

        if request.files.get('updated_mp3_file') is not None:
            mp3_file = request.files['updated_mp3_file'] 
            mp3_filename = secure_filename(mp3_file.filename)
            if not mp3_filename.endswith('.mp3'):
                return jsonify({"message": "Only Mp3 files allowed"}), 400
            else:
                mp3_filepath = os.path.join('static/uploads', mp3_filename)
                if os.path.exists(mp3_filepath):
                    return jsonify({"message": "Mp3 is aleady uploaded"}), 409
                else:
                    mp3_file.save(mp3_filepath)
                    song_obj.mp3_file = mp3_filename
                    audio = MP3(mp3_file)
                    song_obj.song_duration = audio.info.length
                    updated = True
        
        if request.files.get('updated_song_lyrics') is not None:
            lyrics_file = request.files['updated_song_lyrics']
            lyrics_filename = secure_filename(lyrics_file.filename)
            if not lyrics_filename.endswith('txt'):
                return jsonify({"message": "Only txt files allowed for lyrics"}), 400
            else:
                lyrics_filepath = os.path.join('static/uploads', lyrics_filename)
                if os.path.exists(lyrics_filepath):
                    return jsonify({"message": "txt file already uploaded"}), 409
                else:
                    lyrics_file.save(lyrics_filepath)

                    with open(lyrics_filepath, 'r', encoding='utf-8') as lyrics_file:
                        lyrics = lyrics_file.read()
                    
                    song_obj.lyrics = lyrics
                    updated = True
       
        
        if updated:
            db.session.add(song_obj)
            db.session.commit()
            return jsonify({"message": "Details updated successfully"}), 200
        else:
            return jsonify({"message": "No details were updated"}), 400
    else:
        return jsonify({"message": "Song already uploaded by the creator"}), 400
#---------------------------------------------------------------------------------------------


@app.post('/delete_song')
def delete_song():
    data = request.get_json()
    
    if data.get('song_id'):
        song_id = int(data.get('song_id'))
        if Songs.query.get(song_id):
            song_obj = Songs.query.get(song_id)
            deleted_info_obj = DeletedInfo(songs_deleted_by_creator =1, creator_id = int(data.get('user_id')))
            db.session.add(deleted_info_obj)
            db.session.delete(song_obj)
            db.session.commit()
            return jsonify({"message": "Song deleted successfully"}), 200
        else:
            return jsonify({"message": "No song found with the associated song ID"}), 404
    else:
        return jsonify({"message": "Please provide a valid song ID"}), 400
#---------------------------------------------------------------------------------------------
    


@app.post('/delete_song_by_admin')
def delete_song_by_admin():
    data = request.get_json()
    
    if data.get('song_id'):
        song_id = int(data.get('song_id'))
        if Songs.query.get(song_id):
            song_obj = Songs.query.get(song_id)
            creator_id = song_obj.creator_id
            deleted_info_obj = DeletedInfo(songs_deleted_by_admin =1, creator_id = creator_id)
            db.session.add(deleted_info_obj)
            db.session.delete(song_obj)
            db.session.commit()
            return jsonify({"message": "Song deleted successfully"}), 200
        else:
            return jsonify({"message": "No song found with the associated song ID"}), 404
    else:
        return jsonify({"message": "Please provide a valid song ID"}), 400
#---------------------------------------------------------------------------------------------



@app.post("/move_song")
def move_song():
    data = request.get_json()

    if data.get('song_id') != '':
        song_id = int(data.get('song_id'))
    else:
        return jsonify({"message": "Not a valid song ID"}), 400
    
    if data.get('updated_album_id') != '':
        updated_album_id = int(data.get('updated_album_id'))
    else:
        return jsonify({"message": "Not a valid album ID"}),404
    
    if Songs.query.get(song_id):
        songs_obj = Songs.query.get(song_id)
        songs_obj.album_id = updated_album_id
        db.session.add(songs_obj)
        db.session.commit()
        return jsonify({"message": "Song successfully moved"}), 200
    else:
        return jsonify({"message": "Please provide a valid song ID"}), 400
#---------------------------------------------------------------------------------------------


@app.post("/edit_album")
def edit_album():
    data = request.get_json()
    album_id = int(data.get('album_id'))
    updated_album_name = data.get('updated_album_name').lower()

    existing_album = Albums.query.filter_by(album_name = updated_album_name).first()

    if not existing_album:
        if updated_album_name:
            albums_obj = Albums.query.get(album_id)
            original_album_name = albums_obj.album_name
            albums_obj.album_name = updated_album_name
            db.session.add(albums_obj)
            db.session.commit()
            return jsonify({"message": "Album details updated sucessfully",
                            "original_album_name": original_album_name}), 200
        else:
            return jsonify({"message": "No album name provided"}), 400
    else:
        return jsonify({"message": "Album already created by the creator"}), 400 
#---------------------------------------------------------------------------------------------


@app.post("/album_details")
def album_details():
    data = request.get_json()
    album_id = int(data.get('album_id'))

    if Albums.query.get(album_id):
        albums_obj = Albums.query.get(album_id)
        return jsonify({
            "album_name": albums_obj.album_name
        }), 200
    else:
        return jsonify({"message": "No album assocaited with the album ID provided"}), 404
#---------------------------------------------------------------------------------------------


@app.post('/delete_album')
def delete_album():
    data = request.get_json()
    
    if data.get('album_id'):
        album_id = int(data.get('album_id'))
        if Albums.query.get(album_id):
            albums_obj = Albums.query.get(album_id)
            songs = len(albums_obj.songs)
            delete_info_obj = DeletedInfo(albums_deleted_by_creator = 1, songs_deleted_by_creator = songs, creator_id = data.get('user_id'))
            db.session.add(delete_info_obj)
            albums_obj = Albums.query.get(album_id)
            db.session.delete(albums_obj)
            db.session.commit()
            return jsonify({"message": "Album deleted successfully"}), 200
        else:
            return jsonify({"message": "No album found with the provided album ID"}), 404
    else:
        return jsonify({"message": "Please provide a valid album ID"}), 400
#---------------------------------------------------------------------------------------------


@app.get('/user_songs')
def user_songs():
    all_songs = Songs.query.all()
    
    songs_json = [{"song_id": song.song_id,
                  "song_name": song.song_name,
                  "artist_first_name": User.query.get(song.creator_id).f_name,
                  "artist_last_name": User.query.get(song.creator_id).l_name,
                  "album": Albums.query.get(song.album_id).album_name,
                  "genre": song.genre,
                  "release_date": song.release_date,
                  "duration": song.duration,
                  "song_rating": avg_song_rating(song.song_id)} for song in all_songs]

    return jsonify({"data": songs_json}), 200
#---------------------------------------------------------------------------------------------


@app.post('/song_rating_update')
def song_rating_update():
    data = request.get_json()
    user_id = int(data.get('user_id'))
    song_id = int(data.get('song_id'))
    song_rating = float(data.get('song_rating'))

    user_obj = User.query.get(user_id)
    song_obj = Songs.query.get(song_id)

    if song_obj not in user_obj.songs: 
        if SongRating.query.filter_by(song_id =song_id, user_id = user_id).first() is None:
            song_rating_obj = SongRating(song_id = song_id, user_id = user_id, rating = song_rating)
            db.session.add(song_rating_obj)
            db.session.commit()
            return jsonify({"message": "Rating succesfully added"}), 200
        else:
            song_rating_obj = SongRating.query.filter_by(song_id =song_id, user_id = user_id).first()
            song_rating_obj.rating = song_rating
            db.session.add(song_rating_obj)
            db.session.commit()
            return jsonify({"message": "Rating succesfully updated"}), 200
    else:
        return jsonify({"message": "Creator cannot rate their own songs"}), 400
#---------------------------------------------------------------------------------------------


@app.post('/song_rating')
def song_rating():
    data = request.get_json()
    song_id = data.get('song_id')
    songs_obj = Songs.query.get(song_id)

    songs_obj.song_rating = avg_song_rating(song_id)
    return jsonify({"message": "Records pdated successfully"})
#---------------------------------------------------------------------------------------------


@app.post('/streaming_details_update')
def streaming_details_update():
    data = request.get_json()
    song_id = int(data.get('song_id'))
    user_id = int(data.get('user_id'))

    songs_obj = Songs.query.get(song_id)
    user_obj = User.query.get(user_id)

    if songs_obj not in user_obj.songs:
        song_obj = increase_counter(song_id)
        db.session.add(song_obj)
        db.session.commit()
        return jsonify({"message": "Update successful"}), 200
    else:
        return jsonify({"message": "Cannot increase counter for own uploaded songs"}), 400
#---------------------------------------------------------------------------------------------


@app.post('/create_playlist')
def create_playlist():
    data = request.get_json()
    user_id = int(data.get('user_id'))
    details_empty =  False


    if data.get('playlist_name'):
        playlist_name = data.get('playlist_name').lower()
    else:
        details_empty = True
        return jsonify({"message":"Playlist Name cannot be empty"}), 404

    if details_empty == False:
        existing_playlist = Playlist.query.filter_by(playlist_name=playlist_name, user_id=user_id).first()
        if not existing_playlist:
            playlist_obj = Playlist(playlist_name=playlist_name, user_id=user_id)
            db.session.add(playlist_obj)
            db.session.commit()
            return jsonify({"message": "Playlist sucessfully created"}), 200
        else:
            return jsonify({'message': "Playlist already created by the user"}), 400
#---------------------------------------------------------------------------------------------


@app.post('/get_user_playlists')
def get_user_playlists():
    data = request.get_json()
    user_id = int(data.get('user_id'))

    user_playlists = Playlist.query.filter_by(user_id = user_id).all()

    playlists_json = [{
        "playlist_id": playlist.playlist_id,
        "playlist_name": playlist.playlist_name,
    } for playlist in user_playlists]

    if user_playlists:
        return jsonify({"data": playlists_json}), 200
    else:
        return jsonify({"message": "You have not created any playlists"}), 404


#---------------------------------------------------------------------------------------------


@app.post('/delete_playlist')
def delete_playlist():
    data = request.get_json()
    
    if data.get('playlist_id'):
        playlist_id = int(data.get('playlist_id'))
        if Playlist.query.get(playlist_id):
            playlist_obj = Playlist.query.get(playlist_id)
            db.session.delete(playlist_obj)
            db.session.commit()
            return jsonify({"message": "Playlist deleted successfully"}), 200
        else:
            return jsonify({"message": "No Playlist found with the provided playlist ID"}), 404
    else:
        return jsonify({"message": "Please provide a valid playlist ID"}), 400
#---------------------------------------------------------------------------------------------


@app.post("/assign_to_playlist")
def assign_to_playlist():
    data = request.get_json()

    song_id = int(data.get('song_id'))
    playlist_id = int(data.get('playlist_id'))

    exisiting_song = Songs.query.get(song_id)
    playlist_obj = Playlist.query.get(playlist_id)

    if exisiting_song not in playlist_obj.tracks:
        playlist_obj.tracks.append(exisiting_song)
        db.session.commit()
        return jsonify({"message": "Song successfully added"}), 200
    else:
        return jsonify({"message": "Song aready in playlist"}), 400
#---------------------------------------------------------------------------------------------


@app.post("/get_playlist_songs")
def get_playlist_songs():
    data = request.get_json()
    playlist_id = int(data.get('playlist_id'))

    playlist_obj = Playlist.query.get(playlist_id)

    playlist_songs = playlist_obj.tracks
    playlist_songs_json = [{"song_id": song.song_id,
                            "song_name": song.song_name,
                            "artist_first_name": User.query.get(song.creator_id).f_name,
                            "artist_last_name": User.query.get(song.creator_id).l_name,
                            "album": Albums.query.get(song.album_id).album_name,
                            "genre": song.genre,
                            "release_date": song.release_date,
                            "duration": song.duration,
                            "song_rating": avg_song_rating(song.song_id)} for song in playlist_songs]
        
    return jsonify({"data": playlist_songs_json}), 200
#---------------------------------------------------------------------------------------------


@app.post("/playlist_details")
def playlist_details():
    data = request.get_json()
    playlist_id = int(data.get('playlist_id'))

    if Playlist.query.get(playlist_id):
        playlist_obj = Playlist.query.get(playlist_id)
        return jsonify({
            "playlist_name": playlist_obj.playlist_name
        }), 200
    else:
        return jsonify({"message": "No playlist assocaited with the playlist ID provided"}), 404
#---------------------------------------------------------------------------------------------


@app.post("/delete_playlist_song")
def delete_playlist_song():
    data = request.get_json()

    song_id = int(data.get('song_id'))
    playlist_id = int(data.get('playlist_id'))

    playlist_obj = Playlist.query.get(playlist_id)
    songs_obj = Songs.query.get(song_id)

    playlist_obj.tracks.remove(songs_obj)
    db.session.commit()
    return jsonify({"message": "Song successfully removed"}), 200
#---------------------------------------------------------------------------------------------


@app.get('/user_albums')
def user_albums():
    all_albums = Albums.query.all()
    
    albums_json = [{
                    "album_id": album.album_id,
                    "album_name": album.album_name,
                    "f_name": User.query.get(album.creator_id).f_name,
                    "l_name": User.query.get(album.creator_id).l_name
                    } for album in all_albums]  

    return jsonify({"data": albums_json}), 200
#---------------------------------------------------------------------------------------------


@app.get('/user_genre')
def user_genres():
    all_songs = Songs.query.all()
    genre_list = []

    for song in all_songs:
        genre = song.genre
        if genre not in genre_list:
            genre_list.append(genre)
    
    genre_json = [{
                    "genre_name": genre,
                    } for genre in genre_list]

    return jsonify({"data": genre_json}),200  
#---------------------------------------------------------------------------------------------


@app.post('/genre_song_details')
def genre_song_details():
    data = request.get_json()
    genre = data.get('genre_name') 

    songs_obj = Songs.query.filter_by(genre = genre).all()

    songs_obj_json = [{"song_id": song.song_id,
                        "song_name": song.song_name,
                        "f_name": User.query.get(song.creator_id).f_name,
                        "l_name": User.query.get(song.creator_id).l_name,
                        "album": Albums.query.get(song.album_id).album_name,
                        "release_date": song.release_date,
                        "duration": song.duration,
                        "rating": avg_song_rating(song.song_id)} for song in songs_obj]
    
    return jsonify({"data": songs_obj_json}), 200
#---------------------------------------------------------------------------------------------


@app.get('/get_avg_song_ratings_chart')
def avg_song_ratings_chart():
    songs = Songs.query.all()
    x_songs = []
    y_song_rating = []

    for song in songs:
        if avg_song_rating(song.song_id) != 'Not Rated':
            x_songs.append(song.song_name)
            y_song_rating.append(avg_song_rating(song.song_id))
    
    plt.bar(x_songs, y_song_rating, width=0.5, color='green')
    plt.tight_layout()
    path = "static/charts/songs_rating.png"
    plt.savefig(path)
    plt.clf()
    
    return jsonify({"path": path}), 200
#---------------------------------------------------------------------------------------------


@app.get('/get_songs_by_genre_chart')
def songs_by_genre_chart():
    songs = Songs.query.all()
    x_genres = []

    for song in songs:
        x_genres.append(song.genre)
        
    sns.countplot(x =x_genres, orient='v', width=0.5, color='green')
    plt.tight_layout()
    path = "static/charts/songs_by_genre.png"
    plt.savefig(path)
    plt.clf()
    return jsonify({"path": path}), 200
#---------------------------------------------------------------------------------------------


@app.get('/get_avg_creator_ratings_chart')
def avg_creator_ratings_chart():
    creators = Role.query.filter_by(name = 'creator').first().users
    x_creator_names = []
    y_creator_rating = []

    for creator in creators:
        if avg_creator_rating(creator.user_id) != 'Not Rated':
            x_creator_names.append(creator.user_name)
            y_creator_rating.append(avg_creator_rating(creator.user_id))
    
    plt.bar(x_creator_names, y_creator_rating, width=0.5, color='green')
    plt.tight_layout()
    path = "static/charts/creator_rating.png"
    plt.savefig(path)
    plt.clf()

    return jsonify({"path": path}), 200
#---------------------------------------------------------------------------------------------


@app.get('/get_avg_albumm_ratings_chart')
def avg_album_ratings_chart():
    albums = Albums.query.all()
    x_album_names = []
    y_album_rating = []

    for album in albums:
        if avg_album_rating(album.album_id) != 'Not Rated':
            x_album_names.append(album.album_name)
            y_album_rating.append(avg_album_rating(album.album_id))
    
    plt.bar(x_album_names, y_album_rating, width=0.5, color='green')
    plt.tight_layout()
    path = "static/charts/album_rating.png"
    plt.savefig(path)
    plt.clf()

    return jsonify({"path": path}), 200
#---------------------------------------------------------------------------------------------


@app.post("/flag_song")
def flag_song():
    data = request.get_json()
    song_id = int(data.get('song_id'))
    user_id = int(data.get('user_id'))

    user_obj = User.query.get(user_id)
    songs_obj = Songs.query.get(song_id)

    if song_id:
        if songs_obj not in user_obj.songs:
            if Songs.query.get(song_id):
                flag_song_obj = FlagSong(user_id = user_id, song_id = song_id, flagged = 'Yes')
                db.session.add(flag_song_obj)
                db.session.commit()
                return jsonify({"message": "Song successfully flagged"}), 200
            else:
                return jsonify({"message": "No song associated with the provided song Id"}), 400
        else:
            return jsonify({"message": "Creator cannot flag their own songs"}), 400
    else:
        return jsonify({"message": "No song Id provided"}), 404
#---------------------------------------------------------------------------------------------



@app.post("/unflag_song")
def unflag_song():
    data = request.get_json()
    song_id = int(data.get('song_id'))
    user_id = int(data.get('user_id'))

    user_obj = User.query.get(user_id)
    songs_obj = Songs.query.get(song_id)

    if song_id:
        if songs_obj not in user_obj.songs:
            if Songs.query.get(song_id):
                if FlagSong.query.filter_by(song_id = song_id, user_id = user_id).first():
                    flag_song_obj = FlagSong.query.filter_by(song_id = song_id, user_id = user_id).first()
                    flag_song_obj.flagged = 'No'
                    db.session.add(flag_song_obj)
                    db.session.commit()
                    return jsonify({"message": "Song successfully unflagged"}), 200
                else: return jsonify({"message": "Song has not been flagged by the user"}), 400
            else:
                return jsonify({"message": "No song associated with the provided song Id"}), 400
        else:
            return ({"message": "Creator cannot unflag their own songs"}), 400
    else:
        return jsonify({"message": "No song Id provided"}), 404
#---------------------------------------------------------------------------------------------


@app.get('/admin_details')
def admin_details():
    admin_name = Role.query.filter_by(name = 'admin').first().users[0].user_name
    total_creators = len(Role.query.filter_by(name = 'creator').first().users)
    total_users = len(Role.query.filter_by(name = 'general_user').first().users)
    total_songs = len(Songs.query.all())
    total_albums = len(Albums.query.all())
    flagged_songs = 0
    
    for song in Songs.query.all():
        if FlagSong.query.filter_by(song_id = song.song_id).first():
            if FlagSong.query.filter_by(song_id = song.song_id, flagged = 'Yes').first():
                flagged_songs += 1


    return jsonify({"admin_name": admin_name,
                    "total_creators": total_creators,
                    "total_users": total_users,
                    "total_songs": total_songs,
                    "total_albums": total_albums,
                    "flagged_songs": flagged_songs}), 200
#---------------------------------------------------------------------------------------------


@app.get('/get_flagged_songs')
def flagged_songs():
    flagged_songs = []

    for song in Songs.query.all():
        if FlagSong.query.filter_by(song_id = song.song_id).first():
            if FlagSong.query.filter_by(song_id = song.song_id, flagged = 'Yes').first():
                flagged_songs.append(song.song_name)

    flagged_songs_json = [{
                            "song_id": Songs.query.filter_by(song_name = song).first().song_id,
                            "song_name": song,
                            "f_name": User.query.get(Songs.query.filter_by(song_name = song).first().creator_id).f_name,
                            "l_name": User.query.get(Songs.query.filter_by(song_name = song).first().creator_id).l_name,
                            "album": Albums.query.get(Songs.query.filter_by(song_name = song).first().album_id).album_name,
                            "flagged": len(FlagSong.query.filter_by(song_id = Songs.query.filter_by(song_name = song).first().song_id, flagged = 'Yes').all())} for song in flagged_songs]

    return jsonify({"data": flagged_songs_json}),200

#---------------------------------------------------------------------------------------------
@app.post('/download_csv')
def download_csv():
    data = request.get_json()
    creator_id = int(data.get('user_id'))
    print("creator_id", creator_id)
    task = creator_details_csv.delay(creator_id)
    return jsonify({"task_id": task.id})
#---------------------------------------------------------------------------------------------



@app.get('/get_csv/<task_id>')
def get_csv(task_id):
    res = AsyncResult(task_id)

    if res.ready():
        filename = res.result
        return send_file(filename, as_attachment=True)
    else:
        return jsonify({"message", "Task Pending"}), 404
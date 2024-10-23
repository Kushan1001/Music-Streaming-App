from celery import shared_task
from .model import Songs, User, Role, Albums, SongRating, FlagSong, DeletedInfo
import flask_excel as excel
from .mail import send_mail
from datetime import date, timedelta


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
#-----------------------------------------------------------------------------------------------


@shared_task(ignore_result = False)
def creator_details_csv(creator_id):
    songs_data = Songs.query.filter_by(creator_id = creator_id).with_entities(Songs.song_name, Songs.release_date, 
                                                                    Songs.genre, Songs.duration, Songs.counter).all()
    csv_output = excel.make_response_from_query_sets(songs_data, column_names=['song_name', 'release_date', 'genre',
                                                                'duration', 'counter'], file_type='csv')
    filename = 'creator_details.csv'

    with open(filename, 'wb') as f:
        f.write(csv_output.data)

    return filename 
#-----------------------------------------------------------------------------------------------



@shared_task(ignore_result = True)
def daily_reminder():
    all_users = User.query.all()

    if all_users:
        for user in all_users:
            if user.visited == 'No':
                username = user.user_name
                html_content = f'''<div>Greetings {username}
                                    <br>
                                    <br>
                                    <p>You have not visisted the app all day. Please visit !</p>
                                    <br>
                                    <p>Warm Regards</p> 
                                    <p>Music App Team</p>     
                                </div>'''
                send_mail(user.email_id, 'Daily Reminder', html_content )
        return "reminder sent"
#-----------------------------------------------------------------------------------------------



@shared_task(ignore_result = True)
def montly_report():
    all_creators = Role.query.filter_by(name = 'creator').first().users

    # current_date = date.today().replace(day=1)
    # previous_date = current_date - timedelta(days=1)
    # previous_month = previous_date.month

    previous_month = date.today().month


    if all_creators:
        for creator in all_creators:

            deleted_info = DeletedInfo.query.filter_by(creator_id = creator.user_id).all()
            songs_deleted_by_admin = 0
            songs_deleted_by_creator = 0
            albums_deleted_by_creator  = 0
            for record in deleted_info:
                songs_deleted_by_admin += record.songs_deleted_by_admin
                songs_deleted_by_creator += record.songs_deleted_by_creator
                albums_deleted_by_creator += record.albums_deleted_by_creator

            all_songs = Songs.query.filter_by(creator_id = creator.user_id, month=previous_month).all()
            username = creator.user_name
            songs_uploaded = len(Songs.query.filter_by(creator_id = creator.user_id, month=previous_month).all()) + songs_deleted_by_creator + songs_deleted_by_admin
            albums_uploaded = len(Albums.query.filter_by(creator_id = creator.user_id, month = previous_month).all()) + albums_deleted_by_creator
            flagged_songs = 0

            for song in all_songs:
                if FlagSong.query.filter_by(song_id = song.song_id).first():
                    if FlagSong.query.filter_by(song_id = song.song_id, flagged = 'Yes').first():
                        flagged_songs += 1

                        
            song_ratings_user = []
            for song in Songs.query.filter_by(creator_id = creator.user_id, month=previous_month).all():
                ratings = song.song_ratings
                if ratings:
                    for rating in ratings:
                        user_id = rating.user_id
                        if user_id not in song_ratings_user:
                            song_ratings_user.append(user_id)
            
            user_rating = len(song_ratings_user)

            
            most_streamed_song = ''
            most_streamed_song_counter = 0
            for song in all_songs:
                if song.counter > most_streamed_song_counter:
                    most_streamed_song_counter = song.counter
                    most_streamed_song = song.song_name
        
            if most_streamed_song == '':
                most_streamed_song = 'Info not available'


            total_streams = 0
            for song in all_songs:
                total_streams +=  song.counter

            
            highest_rated_song = ''
            highest_rating = 0
            for song in all_songs:
                if avg_song_rating(song.song_id) != 'Not Rated':
                    if avg_song_rating(song.song_id) > highest_rating:
                        highest_rating = avg_song_rating(song.song_id)
                        highest_rated_song = song.song_name
            
            if highest_rated_song == '':
                highest_rated_song = 'Info not available'

                
            html_content = f'''
                            <div>
                                Greetings {username}
                                <br>

                                <p>Your Monthly Report</p>
                                <br>

                                <p>Songs Uploaded during the month: {songs_uploaded}</p>
                                <p>Albums Uploaded during the month: {albums_uploaded}</p>
                                <p>Songs deleted by creator during the month:{songs_deleted_by_creator}</p>
                                <p>Songs deleted by admin during the month:{songs_deleted_by_admin}</p>
                                <p>Albums deleted by creator during the month:{albums_deleted_by_creator}</p>
                                <p>Songs Flagged but not deleted during the month: {flagged_songs}</p>
                                <p>Ratings Received in the month: {user_rating} people rated your songs</p>
                                <p>Total Streams for the month: {total_streams}</p>
                                <p>Most Streamed Song for the month: {most_streamed_song}</p>
                                <p>Highest Rated Song for the month: {highest_rated_song}</p>
                                <br>

                                <p>Warm Regards</p>
                                <p>Music App Team</p>
                            </div>
                            '''
            
            send_mail(creator.email_id, 'Monthly Report', html_content)
        return "report sent"
            




from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin


db = SQLAlchemy()

class User(db.Model, UserMixin):
    user_id = db.Column(db.Integer(), primary_key=True, autoincrement=True)
    email_id = db.Column(db.String(50), nullable=False, unique=True)
    password = (db.Column(db.String(50), nullable=False))
    user_name = db.Column(db.String(100), nullable=False)
    f_name = db.Column(db.String(50), nullable =False)
    l_name = db.Column(db.String(50))
    active =  db.Column(db.Boolean())
    visited = db.Column(db.String(), default='No')
    fs_uniquifier = db.Column(db.String(500), unique=True, nullable=False)
    roles = db.relationship('Role', backref='users', secondary='roles_users')
    albums = db.relationship('Albums', backref='creator')
    songs = db.relationship('Songs', backref='creator')
    ratings = db.relationship('SongRating', backref='user')
    playlists = db.relationship('Playlist', backref='user')

class Role(db.Model, RoleMixin):
    role_id = db.Column(db.Integer(), primary_key=True, autoincrement=True)
    name = db.Column(db.String(), unique=True, nullable=False)
    descr = db.Column(db.String(), unique=True, nullable=False)

class UserRoles(db.Model):
    __tablename__ = 'roles_users'
    id = id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column('user_id', db.Integer(), db.ForeignKey('user.user_id'))
    role_id = db.Column('role_id', db.Integer(), db.ForeignKey('role.role_id'))       

class Albums(db.Model):
    album_id = db.Column(db.Integer(), primary_key=True, autoincrement=True)
    creator_id = db.Column(db.Integer(), db.ForeignKey('user.user_id'), nullable=False)
    album_name = db.Column(db.String(100), nullable=False)
    month = db.Column(db.String())
    songs = db.relationship('Songs', backref='albums', cascade='all, delete-orphan')

class Songs(db.Model):
    song_id = db.Column(db.Integer(), primary_key=True, autoincrement=True)
    song_name = db.Column(db.String(500), nullable=False)
    creator_id = db.Column(db.String(100), db.ForeignKey('user.user_id'), nullable=False)
    album_id = db.Column(db.Integer(), db.ForeignKey('albums.album_id'), nullable=False)
    genre = db.Column(db.String(500), nullable=False)
    release_date = db.Column(db.Date())
    month = db.Column(db.String())
    duration = db.Column(db.String(20))
    song_rating = db.Column(db.String(), default='Not Rated')
    lyrics = db.Column(db.String(1000000), nullable=False)
    mp3_file = db.Column(db.String(1000), nullable=False)
    counter = db.Column(db.Integer(), default=0)
    song_ratings = db.relationship('SongRating', backref='song',cascade='all, delete-orphan')
    songs_flagged = db.relationship('FlagSong',backref='song', cascade='all, delete-orphan' )

class DeletedInfo(db.Model):
    index = db.Column(db.Integer(), primary_key=True, autoincrement=True)
    creator_id = db.Column(db.Integer(), nullable = False)
    songs_deleted_by_admin  = db.Column(db.Integer(), default = 0)
    songs_deleted_by_creator = db.Column(db.Integer(), default = 0)
    albums_deleted_by_creator = db.Column(db.Integer(), default = 0)

class FlagSong(db.Model):
    index = db.Column(db.Integer(), primary_key=True, autoincrement=True)
    user_id = user_id = db.Column(db.Integer(), db.ForeignKey('user.user_id'), nullable=False)
    song_id = db.Column(db.Integer(), db.ForeignKey('songs.song_id'), nullable=False)
    flagged = db.Column(db.String())
   
class SongRating(db.Model):
    index = db.Column(db.Integer(), primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer(), db.ForeignKey('user.user_id'), nullable=False)
    song_id = db.Column(db.Integer(), db.ForeignKey('songs.song_id'), nullable=False)
    rating = db.Column(db.Integer())

class Playlist(db.Model):
    playlist_id = db.Column(db.Integer(), primary_key=True, autoincrement=True)
    playlist_name = db.Column(db.String(100), nullable=False) #unique because same playlist do not belong to multiple users
    user_id = db.Column(db.Integer(), db.ForeignKey('user.user_id'), nullable=False)
    tracks = db.relationship('Songs', backref='playlist', secondary = 'playlist_songs_association')

playlist_songs_association = db.Table(
    'playlist_songs_association',
    db.Column('playlist_id', db.Integer, db.ForeignKey('playlist.playlist_id'), nullable=False), 
    db.Column('song_id', db.Integer, db.ForeignKey('songs.song_id'), nullable = False) 
)


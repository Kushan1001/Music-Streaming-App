import homepage from "./components/homepage.js"
import signin from "./components/signin.js"
import admin_dashboard from "./components/admin_dashboard.js"
import user_dashboard from "./components/user_dashboard.js"
import creator_dashboard from "./components/creator_dashboard.js"
import signup from "./components/signup.js"
import access_denied from "./components/access_denied.js"
import upload_song from "./components/upload_song.js"
import create_album from "./components/create_album.js"
import select_album from "./components/select_album.js"
import uploaded_creator_songs from "./components/uploaded_creator_songs.js"
import play_creator_songs from "./components/play_creator_song.js"
import uploaded_creator_albums from "./components/uploaded_creator_albums.js"
import creator_album_songs from "./components/creator_album_songs.js"
import edit_song_details from "./components/edit_song_details.js"
import move_song from "./components/move_song.js"
import edit_album_details from "./components/edit_album_details.js"
import user_songs from "./components/user_songs.js"
import play_user_songs from "./components/play_user_songs.js"
import create_playlist from "./components/create_playlist.js"
import user_playlist from "./components/user_playlist.js"
import add_to_playlist from "./components/add_to_playlist.js"
import songs_in_playlist from "./components/songs_in_playlist.js"
import user_albums from "./components/user_albums.js"
import user_album_songs from "./components/user_album_songs.js"
import user_genres from "./components/user_genres.js"
import user_genre_songs from "./components/user_genre_songs.js"
import detailed_app_stats from "./components/detailed_app_stats.js"
import genre_songs_chart from "./components/genre_songs_chart.js"
import songs_rating_chart from "./components/songs_rating_chart.js"
import creators_rating_chart from "./components/creators_rating_chart.js"
import albums_rating_chart from "./components/albums_rating_chart.js"
import see_flagged_songs from "./components/see_flagged_songs.js"


const routes = [
    {path:"/", component:homepage},
    {path:"/signin", component:signin, name:"signin"},
    {path:"/admin_dashboard", component:admin_dashboard, name:"admin_dashboard"},
    {path:"/user_dashboard", component:user_dashboard, name:"user_dashboard"},
    {path:"/creator_dashboard", component:creator_dashboard, name: "creator_dashboard"},
    {path:"/signup", component:signup, name:"signup"},
    {path:"/access_denied", component:access_denied, name:"acess_denied"},
    {path:"/upload_song", component:upload_song, name:"upload_song"},
    {path:"/create_album", component:create_album, name:"create_album"},
    {path:"/select_album", component:select_album, name:"select_album"},
    {path:"/uploaded_creator_songs", component:uploaded_creator_songs, name:"uploaded_creator_songs"},
    {path:"/play_creator_songs", component:play_creator_songs, name:"play_creator_songs"},
    {path:"/uploaded_creator_albums", component:uploaded_creator_albums, name:"uploaded_creator_albums"},
    {path:"/creator_album_songs", component:creator_album_songs, name:"creator_album_songs"},
    {path:"/edit_song_details", component:edit_song_details, name:"edit_song_details"},
    {path:"/move_song", component:move_song, name:"move_song" },
    {path:"/edit_album_details", component:edit_album_details, name:"edit_album_details"} ,
    {path:"/user_songs", component:user_songs, name:"user_songs"},
    {path:"/play_user_songs", component:play_user_songs, name:"play_user_songs"},
    {path:"/create_playlist", component:create_playlist, name:"create_playlist"},
    {path:"/user_playlist", component:user_playlist, name:"user_playlist"},
    {path:"/add_to_playlist", component:add_to_playlist, name:"add_to_playlist"},
    {path:"/songs_in_playlist", component:songs_in_playlist, name:"songs_in_palylist"},
    {path:"/user_albums", component:user_albums, name:"user_albums"},
    {path:"/user_album_songs", component:user_album_songs, name:"user_album_songs"},
    {path:"/user_genres", component:user_genres, name:user_genres, name:"user_genres"},
    {path:"/user_genre_songs", component:user_genre_songs, name:"user_genre_songs"},
    {path:"/detailed_app_stats", component:detailed_app_stats, name:"detailed_app_stats"},
    {path:"/genre_songs_chart", component:genre_songs_chart, name:"genre_songs_chart"},
    {path:"/songs_rating_chart", component:songs_rating_chart, name:"songs_rating_chart"},
    {path:"/creators_rating_chart", component:creators_rating_chart, name:"creators_rating_chart"},
    {path:"/albums_rating_chart", component:albums_rating_chart, name:"albums_rating_chart"},
    {path:"/see_flagged_songs", component:see_flagged_songs, name:"see_flagged_songs"}
]


export default new VueRouter({
    routes
})



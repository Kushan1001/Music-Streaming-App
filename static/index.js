import router from './router.js'

router.beforeEach((to, from , next)=>{
    if (to.name == 'admin_dashboard' || to.name == "detailed_app_stats" || to.name == "genre_songs_chart" || to.name == "songs_rating_chart"
    || to.name == "creators_rating_chart" || to.name == "albums_rating_chart" || to.name == "see_flagged_songs"){
        if (!localStorage.getItem('auth-token')){
            next("/signin")
        }
       else if (localStorage.getItem('role') !== "admin"){
        next("/access_denied")
        }
        else {
        next()
        }
    }else{
        next()
    } 
})

router.beforeEach((to, from, next)=>{
    if (to.name == "user_dashboard" || to.name == "user_songs" || to.name == "play_user_songs" || to.name == "create_playlist"
    || to.name == "user_playlist" || to.name == "add_to_playlist" || to.name == "songs_in_palylist" || to.name == "user_albums" ||
    to.name == "user_album_songs" || to.name == "user_genres" || to.name == "user_genre_songs"){
        if (!localStorage.getItem('auth-token')){
            next("/signin")
        }
        else if (localStorage.getItem('role') !== "general_user"){
            next("/access_denied")
        }
        else {
            next()
        }
    }else{
        next()
    }
})


router.beforeEach((to, from, next)=>{
    if (to.name == "upload_song" || to.name == "create_album" || to.name == "select_album" || to.name == "uploaded_creator_songs"
        || to.name == "play_creator_songs" || to.name == "uploaded_creator_albums" || to.name == "creator_album_songs" || to.name == "creator_dashboard"
        || to.name == "edit_song_details" || to.name == "move_song" || to.name == "edit_album_details"){
        if (!localStorage.getItem('auth-token')){
            next("/signin")
        }
        else if (localStorage.getItem('role') !== "creator"){
            next("/access_denied")
        }
        else {
            next()
        }
    }else{
        next()
    }
})




Vue.component('star-rating', VueStarRating.default);



new Vue({
    el: "#app",
    template: "<router-view />",
    router
    
})
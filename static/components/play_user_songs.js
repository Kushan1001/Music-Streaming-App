export default{
    template:`
    <div>
        <div v-if="details.song_id === undefined">
            <h1 style="text-align: center; margin-top: 2px; font-size:50px">No song was selected</h1>
            <div style="margin-top: 20px; text-align:center; margin-right:150px">
                <button @click="go_back">Go to creator dashboard</button>
            </div>   
        </div>

        <div v-else>
            <h1 style="text-align: center; margin-top: 2px; font-size:50px">Now Playing: {{ song_name }}</h1>
            <div style="text-align:center; margin-top:30px">
                <div style="border: 2px solid black; display: inline-block; padding: 20px;">
                    <div style="text-align:center; margin-top:30px">
                        <button @click="multipleFunctions" style="font-size:30px">Play</button>
                        <button @click="pause_audio" style="font-size:30px">Pause</button>
                        <button @click="stop_audio" style="font-size:30px">Stop</button>
                    </div>
                    <div style="margin-top:50px">
                        <h4 style="font-weight: bold; font-size:30px">Lyrics</h4>
                        <pre style="margin-top:5px">{{ lyrics }}</pre>
                    </div>
                </div>
            </div>

            <span>
                <div style="text-align:center; margin-top:80px">
                    <div style="text-align:center; margin-top: 80px;">
                        <div v-if="rating_msg" style="background-color:#b3b300; padding: 10px; border-radius: 5px">
                            <span style="font-weight:bold">{{ rating_msg }}</span>
                            <button @click="clear_rating_msg" style="margin-left: 5px; cursor: pointer; padding:5px; border: none; border-radius: 3px">Close</button>
                        </div>
                    </div>
                    <div style="margin-top:20px">
                        <h4 style="font-weight: bold; font-size:30px">Rate this song</h4>
                        <star-rating v-model="details.song_rating" :increment="0.5" :star-size="30" style="margin-left:680px"></star-rating>
                    </div>
                </div>
            </span>

            <div style="text-align:center; margin-top:50px">
                <button @click="play_another_song(song)">Play Another Song</button>
            </div>
        </div>
    </div>
    `,

    data(){ 
        return{
            details:{
                song_id: this.$route.query['song_id'],
                user_id: localStorage.getItem("user_id"),
                song_rating: 0
            },
            song_name: "",
            mp3_file: "",
            lyrics: "",
            song:"",
            source: this.$route.query['source'],
            album_id: this.$route.query['album_id'],
            rating_msg: "",
            msg :"",
            playlist_id: this.$route.query['playlist_id'],
            album_id: this.$route.query['album_id'], 
            genre: this.$route.query['genre_name']            
        }
    },

    methods:{
        async get_song(){
            const response = await fetch("/get_song_details", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(this.details)
            })
            const data = await response.json()
            if (response.ok){
                console.log("success")
                this.song_name = data.song_name
                this.mp3_file = data.mp3_file
                this.lyrics = data.lyrics
                this.flagged = data.flagged
                this.song = new Audio("static/uploads/" + this.mp3_file)
            }
            else{
                console.log('failed')
            }
        },

        async song_rating_update(){
            const response = await fetch("/song_rating_update", {
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                }, 
                body: JSON.stringify(this.details)
            })
            const data = await response.json()
            
            if (response.ok){
                console.log('rated')
                this.rating_msg = data.message
            }
            else{
                console.log('Not Rated')
                this.rating_msg = data.message
            }
        },

        play_audio(){
            this.song.play();
        },

        pause_audio(){
            this.song.pause();
        },

        stop_audio(){
            this.song.pause()
            this.song.currentTime = 0
        },

        play_another_song(song){
            this.stop_audio(song)

            if (this.source == "songs"){
                this.$router.push("/user_songs")
            }

            if (this.source == "playlist"){
                this.$router.push({path: "/songs_in_playlist", query:{playlist_id: this.playlist_id} })
            }

            if (this.source == "album"){
                this.$router.push({path: "/user_album_songs", query:{album_id: this.album_id} })
            }

            if (this.source == "genre"){
                this.$router.push({path: "/user_genre_songs", query:{genre_name: this.genre} })
            }
        },

        async increase_counter(){
            const response = await fetch("/streaming_details_update", {
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                }, 
                body: JSON.stringify(this.details)
            })
            const data = await response.json()
            
            if (response.ok){
                console.log('success')
            }
            else{
                console.log('failed')
                this.msg = data.message

            }
        },

        multipleFunctions(){
            this.play_audio()
            this.increase_counter()
        },

        go_back(){
            if (this.source == "songs"){
                this.$router.push("/user_songs")
            }

            if (this.source == "playlist"){
                this.$router.push({path: "/songs_in_playlist", query:{playlist_id: this.playlist_id} })
            }

            if (this.source == "album"){
                this.$router.push({path: "/user_album_songs", query:{album_id: this.album_id} })
            }

            if (this.source == "genre"){
                this.$router.push({path: "/user_genre_songs", query:{genre_name: this.genre} })
            }
        },

        clear_msg(){
            this.msg = null
        },

        clear_rating_msg(){
            this.rating_msg = null
        }
    },

    mounted(){
        this.get_song()
    },

    watch:{
        "details.song_rating"(newvalue, oldvalue){
            this.song_rating_update()
        }

    }
}

export default{
    template:`
    <div>
        <div v-if="details.song_id == undefined ">
            <h1 style="text-align: center; margin-top: 2px; font-size:50px">No song was selected</h1>
            <div style="margin-top: 20px; text-align:center; margin-right:150px">
                <button @click="go_back">Go to creator dashboard</button>
            </div>   
        </div>

        <div v-else>
            <h1 style="text-align: center; margin-top: 2px; font-size:50px">Now Playing: {{song_name}}</h1>

            <div style="text-align:center; margin-top:30px">
                <div <div style="border: 2px solid black; display: inline-block; padding: 20px;">
                    <div style="text-align:center; margin-top:20px">
                        <button @click="play_audio" style="font-size:30px">Play</button>
                        <button @click="pause_audio" style="font-size:30px">Pause</button>
                        <button @click="stop_audio" style="font-size:30px">Stop</button>

                        <div style="margin-top:50px">
                            <p style="font-weight: bold; font-size:30px">Lyrics</P>
                            <pre style="margin-top:5px">{{this.lyrics}}</pre>
                        </div>
                    </div>
                </div>
            </div>

            <div style="text-align:center; margin-top:50px">
                <button @click="play_another_song(song)">Play Another Song</button>
            </div>
        </div>
    </div>
    `,

    data(){
        return{
            details:{
                song_id: this.$route.query['song_id']
            },
            song_name: "",
            mp3_file: "",
            lyrics: "",
            song:"",
            source: this.$route.query['source'],
            album_id: this.$route.query['album_id']
            
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
                this.song = new Audio("static/uploads/" + this.mp3_file)
            }
            else{
                console.log('failed')
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
                this.$router.push("/uploaded_creator_songs")
            }
            else (this.$router.push({path:"/creator_album_songs", query:{album_id: this.album_id} }))
        },
        go_back(){
            this.$router.push("/creator_dashboard")
        }
    },

    mounted(){
        this.get_song()
    }
}
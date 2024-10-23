export default{
    template:`
        <div>
            <div v-if="details.song_id == undefined">
                <h1 style="text-align: center; margin-top: 2px; font-size:50px">No song was selected</h1>
                <div style="text-align:center; margin-top:20px">
                    <button @click="go_back">Go to uploaded songs</button>
                </div>
            </div>

            <div v-else>
                <div>
                    <h1 style="text-align: center; margin-top: 2px; font-size:50px">Now Editing: {{song_name}}</h1>
                </div>

                <div style="text-align:center; margin-top:80px">
                    <div v-if="this.msg" style="background-color:#b3b300; padding:10px; border-radius:5px">
                        <span style="font-weight:bold">{{msg}}</span>
                        <button @click="clear_msg" style="margin-left:5px; cursor:pointer; padding:5px; border:none; border-radius:3px">Close</button>
                    </div>
                

                    <div style="text-align: center; margin-top:20px">
                        <div>
                            <label for="song_name">Song Name:</label>
                            <input type="text" id="song_name" v-model="details.updated_song_name">
                        </div>
                        <br>

                        <div>
                            <label for="genre" style="margin-right:42px">Genre:</label>
                            <input type="text" id="genre" v-model="details.updated_song_genre">
                        </div>
                        <br>

                        <div style="margin-left:78px">
                            <label>MP3 File:</label>
                            <input type="file" name="mp3_file" accept=".mp3" @change="upload_mp3_file" ref="mp3_file">
                        </div>
                        <br>

                        <div style="margin-left:78px">
                            <label>Lyrics File:</label>
                            <input type="file" name="lyrics_file" accept=".txt" @change="upload_lyrics_file" ref="lyrics_file">
                        </div>
                        <br>

                        <span><button @click="update_song_details">Edit</button>
                            <button @click="go_back">Select another song</button></span>
                    </div>
                </div>
            </div>
        </div>
    `,

    data(){
        return{
            details:{
                song_id: this.$route.query["song_id"],
                updated_song_name: "",
                creator_id: localStorage.getItem('user_id'),
                updated_song_genre: "",
                updated_song_lyrics: "",
                updated_mp3_file: ""
            },
            song_name: "",
            msg: "",
            album_id: this.$route.query["album_id"],
            source: this.$route.query["source"]
        }
    },

    methods:{
        upload_mp3_file(){
            this.details.updated_mp3_file = this.$refs.mp3_file.files[0]
        },

        upload_lyrics_file(){
            this.details.updated_song_lyrics = this.$refs.lyrics_file.files[0]
        },

        async update_song_details(){
            const fd = new FormData()
                fd.append('creator_id', this.details.creator_id)
                fd.append("song_id", this.details.song_id)
                fd.append("updated_song_name", this.details.updated_song_name)
                fd.append("updated_song_genre", this.details.updated_song_genre)
                fd.append("updated_mp3_file", this.details.updated_mp3_file)
                fd.append("updated_song_lyrics", this.details.updated_song_lyrics)
            
            const response = await fetch ("/edit_song", {
                method : "POST",
                body: fd
            })

            const data = await response.json() 

            if (response.ok){
                console.log('sucess')
                this.msg = data.message

                if (this.source == "album"){
                    this.$router.push({path: '/creator_album_songs/', query:{msg: this.msg, album_id: this.album_id} })
                }
                if (this.source == "songs"){
                    this.$router.push({path: '/uploaded_creator_songs/', query:{msg: this.msg} })      
                }
            }

            else {
                console.log('failed')
                this.msg = data.message
            }   
        },

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
            }
            else{
                console.log('failed')
                this.msg = data.message
            }
        },
        go_back(){
            this.$router.push("/uploaded_creator_songs")
        },

        clear_msg(){
            this.msg = null
        }
    },

    mounted(){
        this.get_song()
    }
}
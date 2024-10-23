export default{
    template: `
    <div>
        <h1 style="text-align: center; margin-top: 2px; font-size:50px">Upload A Song</h1>

        <h2 style="text-align: center; margin-top: 50px; font-size:35px">Enter Song Details</h2>

        <div style="margin-top: 80px; text-align:center">
            <div v-if="this.msg" style="background-color:#b3b300; padding: 10px; border-radius: 5px">
                <span style="font-weight: bold">{{msg}}</span>
                <button @click="clear_msg" style="margin-left: 5px; cursor: pointer; padding:5px; border: none; border-radius: 3px">Close</button>
            </div>
        </div>

        <div style="text-align: center; margin-top:20px">
            <div>
                <label for="song_name">Song Name:</label>
                <input type="text" id="song_name" required="True" v-model="details.song_name">
            </div>
            <br>

            <div>
                <label for="genre" style="margin-right:42px">Genre:</label>
                <input type="text" id="genre" required="True" v-model="details.genre">
            </div>
            <br>

            <div style="margin-left:78px">
                <label>MP3 File:</label>
                <input type="file" name="mp3_file" required="True" accept=".mp3" @change="upload_mp3_file" ref="mp3_file">
            </div>
            <br>

            <div style="margin-left:78px">
                <label>Lyrics File:</label>
                <input type="file" name="lyrics_file" required="True" accept=".txt" @change="upload_lyrics_file" ref="lyrics_file">
            </div>
            <br>
            
            <div style="margin-top: 20px">
                <span style="margin-right:30px"><button @click="upload_song">Upload</button> 
                <button @click="select_album">Choose a different album</button></span>
            </div>        
        </div>
    </div>
    `,

    data(){
        return{
            details:{
                song_name: "",
                creator_id: localStorage.getItem('user_id'),
                album_id: this.$route.query['album_id'],
                genre: "",  
                mp3_file: "",
                lyrics_file: ""
            },
            msg: null   
        }
    },

    methods:{
        upload_mp3_file(){
            this.details.mp3_file = this.$refs.mp3_file.files[0]
        },

        upload_lyrics_file(){
            this.details.lyrics_file = this.$refs.lyrics_file.files[0]
        },

        async upload_song(){
                const fd = new FormData()
                fd.append("song_name", this.details.song_name)
                fd.append("creator_id", this.details.creator_id)
                fd.append("album_id", this.details.album_id)
                fd.append("genre", this.details.genre)
                fd.append("mp3_file", this.details.mp3_file)
                fd.append("lyrics_file", this.details.lyrics_file)

                const response = await fetch ("/upload_song", {
                    method : "POST",
                    body: fd
                })

                if (response.ok){
                    console.log('sucess')
                    this.$router.push('/uploaded_creator_songs')
                }
                else {
                    console.log('failed')
                    const errorData = await response.json()
                    this.msg = errorData.message;
                }   
            },

            select_album(){
                this.$router.push("/select_album")
            },

            clear_msg(){
                this.msg = null
            }
        }
    }
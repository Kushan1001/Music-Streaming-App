export default{
    template:`
        <div>
            <div v-if="songs.length == 0">
                <h1 style="text-align: center; margin-top: 2px; font-size:50px"> No songs available</h1>  
            </div>

            <div v-else> 
                <div>
                    <h1 style="text-align: center; margin-top: 2px; font-size:50px">Available Songs</h1>
                </div>

                <div style="margin-top: 80px; text-align:center">
                    <div v-if="msg" v-if="msg" style="background-color:#b3b300; padding: 10px; border-radius: 5px">
                        <span style="font-weight:bold">{{ msg }}</span>
                        <button @click="clear_msg" style="margin-left: 5px; cursor: pointer; padding: 5px; border: none; border-radius: 3px">Close</button>
                    </div>
                </div>

                <div style="text-align:center; margin-top:20px; margin-right:10px">
                    <label style="margin-right:20px">Search Song:</label>
                    <input type="search" v-model="search_value">
                </div>

                <div style="display:flex; justify-content:center; margin-top:30px; margin-left:100px">
                    <table style="border-collapse:collapse; margin:25px; font-size:18px; min-width:350px">
                        <tr>
                            <th style="border:2px solid black; padding:10px; text-align:center">Index</th>
                            <th style="border:2px solid black; padding:10px; text-align:center">Song Name</th>
                            <th style="border:2px solid black; padding:10px; text-align:center">Album</th>
                            <th style="border:2px solid black; padding:10px; text-align:center">Artist</th>
                            <th style="border:2px solid black; padding:10px; text-align:center">Genre</th>
                            <th style="border:2px solid black; padding:10px; text-align:center">Release Date</th>
                            <th style="border:2px solid black; padding:10px; text-align:center">Duration</th>
                            <th style="border:2px solid black; padding:10px; text-align:center">Rating</th>
                        </tr>

                        <tr v-for="(song, index) in filtered_songs.slice().reverse()">
                            <td style="border:1px solid black; padding:10px; text-align:center">{{index+1}}</td>
                            <td style="border:1px solid black; padding:10px; text-align:center">{{song.song_name}}</td>
                            <td style="border:1px solid black; padding:10px; text-align:center">{{song.album}}</td>
                            <td style="border:1px solid black; padding:10px; text-align:center">{{song.artist_first_name}} {{song.artist_last_name}}</td>
                            <td style="border:1px solid black; padding:10px; text-align:center">{{song.genre}}</td>
                            <td style="border:1px solid black; padding:10px; text-align:center">{{song.release_date}}</td>
                            <td style="border:1px solid black; padding:10px; text-align:center">{{song.duration}}</td>
                            <td style="border:1px solid black; padding:10px; text-align:center">{{song.song_rating}}</td>
                            <td style="border:1px solid black; padding:10px; text-align:center"><button @click="add_song(song.song_id)">Add to playlist</button></td>
                        </tr>
                    </table>
                </div>
            </div>
            <div style="text-align:center">
                <button @click="go_back">See all playlists</button>
            </div>
        </div>
    `,  

    data(){
        return{
            songs:[],
            search_value:"",
            playlist_id: this.$route.query['playlist_id'],
            msg: ""
        } 
    },

    methods:{
        async get_all_songs(){
            const response = await fetch("/user_songs") 
            const data = await response.json()

            if (response.ok){
                this.songs = data.data
                console.log("success")
                this.songs.forEach(song => {
                    song.release_date = new Date(song.release_date).toLocaleDateString("en-GB")
                })            
            }
        },

        async add_song(song_id){
            const playlist_id = this.playlist_id

            const response = await fetch("/assign_to_playlist", {
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({"song_id": song_id,
                                      "playlist_id": playlist_id })
                })

            const data = await response.json()   
            if (response.ok){
                console.log("success")
                this.$router.push({path:"/songs_in_playlist", query:{playlist_id: playlist_id} })

            }
            else{
                console.log("failed")
                this.msg = data.message
            }    
        },

        go_back(){
            this.$router.push("/user_playlist")
        },

        clear_msg(){
            this.msg = null
        }
    },

    computed:{
        filtered_songs(){
            return this.songs.filter(song => song.song_name.includes(this.search_value.toLowerCase()))
        }
    },

    mounted(){
        this.get_all_songs()
    }
}
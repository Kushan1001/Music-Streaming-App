export default{
    template:`
        <div>
            <div v-if="playlist_songs.length == 0">
                <h1 style="text-align: center; margin-top: 2px; font-size:50px"> No songs in the playlist</h1>  
            </div>


            <div v-else>
            <h1 style="text-align: center; margin-top: 2px; font-size:50px; margin-right:120px">Songs in Playlist: {{playlist_name}}</h1>

                <div style="margin-top: 80px; text-align:center; margin-right:100px">
                    <div v-if="msg" style="background-color:#b3b300; padding: 10px; border-radius: 5px">
                        <span style="font-weight:bold">{{ msg }}</span>
                        <button @click="clear_msg" style="margin-left: 5px; cursor: pointer; padding: 5px; border: none; border-radius: 3px">Close</button>
                    </div>
                </div>

                <div style="text-align:center; margin-top:30px; margin-right:200px">
                    <label style="margin-right:20px">Search Song:</label>
                    <input type="search" v-model="search_value">

                    <label style="margin-left:30px">Select Rating</label>
                        <select v-model="rating">
                            <option value="">None Selected</option>
                            <option value="0,1">0-1</option>
                            <option value="1,2">1-2</option>
                            <option value="2,3">2-3</option>
                            <option value="3,4">3-4</option>
                            <option value="4,5">4-5</option>
                        </select>
                </div>

                <div style="display:flex; justify-content:center; margin-top:20px; margin-right:150px">
                    <table style="border-collapse:collapse; margin:25px; font-size:18px; min-width:350px">
                        <tr>
                            <th style="border:2px solid black; padding:10px; text-align:center">Index</th>
                            <th style="border:2px solid black; padding:10px; text-align:center">Song Name</th>
                            <th style="border:2px solid black; padding:10px; text-align:center">Album</th>
                            <th style="border:2px solid black; padding:10px; text-align:center">Artist</th>
                            <th style="border:2px solid black; padding:10px; text-align:center">Genre</th>
                            <th style="border:2px solid black; padding:10px; text-align:center">Release Date</th>
                            <th style="border:2px solid black; padding:10px; text-align:center">Duration(Secs)</th>
                            <th style="border:2px solid black; padding:10px; text-align:center">Rating</th>
                        </tr>

                        <tr v-for="(song, index) in filtered_playlist_songs">
                            <td style="border:1px solid black; padding:10px; text-align:center">{{index+1}}</td>
                            <td style="border:1px solid black; padding:10px; text-align:center">{{song.song_name}}</td>
                            <td style="border:1px solid black; padding:10px; text-align:center">{{song.album}}</td>
                            <td style="border:1px solid black; padding:10px; text-align:center">{{song.artist_first_name}} {{song.artist_last_name}}</td>
                            <td style="border:1px solid black; padding:10px; text-align:center">{{song.genre}}</td>
                            <td style="border:1px solid black; padding:10px; text-align:center">{{song.release_date}}</td>
                            <td style="border:1px solid black; padding:10px; text-align:center">{{song.duration}}</td>
                            <td style="border:1px solid black; padding:10px; text-align:center">{{song.song_rating}}</td>
                            <td style="border:1px solid black; padding:10px; text-align:center"><button @click="play_song(song.song_id)">Play</button></td>
                            <td style="border:1px solid black; padding:10px; text-align:center"><button @click="delete_song(song.song_id)">Delete</button></td>
                            <td style="border:1px solid black; padding:10px; text-align:center"><button @click="flag_song(song.song_id)">Flag</button></td>
                            <td style="border:1px solid black; padding:10px; text-align:center"><button @click="unflag_song(song.song_id)">Unflag</button></td>
                        </tr>
                    </table>
                </div>
            </div>

            <div style="text-align:center; margin-right:130px">
                <button @click="go_back">Add song to playlist</button>
            </div>
        </div>
    `,

    data(){
        return{
            details:{
                playlist_id: this.$route.query['playlist_id']
            },
            playlist_name:"",
            playlist_songs:[],
            search_value:"",
            rating:"" ,
            msg:"" ,
            user_id: localStorage.getItem('user_id')
        }
    },

    methods:{
        async get_playlist_songs(){
            const response = await fetch("/get_playlist_songs",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify(this.details)
            })

            const data = await response.json()

            if (response.ok){
                console.log('success')
                this.playlist_songs = data.data
                this.playlist_songs.forEach(song => {
                    song.release_date = new Date(song.release_date).toLocaleDateString("en-GB")
                })
            }
            else{
                console.log('failed')
            }
        },

    async playlist_details(){
        const response = await fetch("/playlist_details",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify(this.details)
        })

        const data = await response.json()

        if (response.ok){
            console.log('success')
            this.playlist_name = data.playlist_name
        }
        else{
            console.log('failed')
            }
       },

       async delete_song(song_id){
        const response = await fetch("/delete_playlist_song", {
            method:"POST",
            headers: {
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({"song_id": song_id,
                                  "playlist_id": this.details.playlist_id })
        })
        const data = await response.json()
        if (response.ok){
            console.log("success")
            location.reload()

        }
        else{
            console.log("failed")
            this.msg = data.message
        }
    },

    play_song(song_id){
        this.$router.push({path: "/play_user_songs", query:{song_id:song_id, source:"playlist", playlist_id: this.details.playlist_id} })
    },

    go_back(){
        this.$router.push("/user_playlist")
    },

    async flag_song(song_id){
        const response = await fetch("/flag_song", {
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({"song_id": song_id, "user_id": this.user_id})
        })
        const data = await response.json()

        if (response.ok){
            this.msg = data.message
        }
        else{
            this.msg = data.message
        }
    },

    async unflag_song(song_id){
        const response = await fetch("/unflag_song", {
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({"song_id": song_id, "user_id": this.user_id})
        })
        const data = await response.json()

        if (response.ok){
            this.msg = data.message
        }
        else{
            this.msg = data.message
            }
        },
       
        clear_msg(){
            this.msg = null
        }
    
    },

    computed:{
        filtered_playlist_songs(){
            const filtered_by_name =  this.playlist_songs.filter(song => song.song_name.includes(this.search_value.toLowerCase()))

        if (this.rating == ""){
            return filtered_by_name
        }  
        else{ 
            const [min, max] = this.rating.split(",").map(x => parseInt(x, 10))
            return filtered_by_name.filter(song => song.song_rating > min && song.song_rating <= max)
            }
        }
    },

    mounted(){
        this.get_playlist_songs()
        this.playlist_details()
    }
}

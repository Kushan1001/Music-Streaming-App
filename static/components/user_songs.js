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
                    <div v-if="msg" style="background-color:#b3b300; padding: 10px; border-radius: 5px">
                        <span style="font-weight:bold">{{ msg }}</span>
                        <button @click="clear_msg" style="margin-left: 5px; cursor: pointer; padding: 5px; border: none; border-radius: 3px">Close</button>
                    </div>
                </div>

                <div style="text-align:center; margin-top:20px; margin-right:50px">
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
                            <td style="border:1px solid black; padding:10px; text-align:center"><button @click="play_song(song.song_id)">Play</button></td>
                            <td style="border:1px solid black; padding:10px; text-align:center"><button @click="flag_song(song.song_id)">Flag</button></td>
                            <td style="border:1px solid black; padding:10px; text-align:center"><button @click="unflag_song(song.song_id)">Unflag</button></td>
                        </tr>
                    </table>
                </div>
            </div>
            <div style="text-align:center">
                <button @click="go_back">Go to user dashboard</button>
            </div>
        </div>
    `,  

    data(){
        return{
            songs:[],
            search_value:"",
            rating:"",
            msg:"",
            user_id: localStorage.getItem('user_id')
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

        play_song(song_id){
            this.$router.push({path: "/play_user_songs", query:{song_id:song_id, source:"songs"} })
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

        go_back(){
            this.$router.push("/user_dashboard")
        },

        clear_msg(){
            this.msg = null
        }
    },

    computed:{
        filtered_songs(){
            const filtered_by_name =  this.songs.filter(song => song.song_name.includes(this.search_value.toLowerCase()))
        
        if (this.rating == ""){
            return filtered_by_name
        }  
        else{ 
            const [min, max] = this.rating.split(",").map(x => parseInt(x, 10))
            return filtered_by_name.filter(song => song.song_rating > min && song.song_rating <= max)
            }    
        },
    },

    mounted(){
        this.get_all_songs()
    }
}
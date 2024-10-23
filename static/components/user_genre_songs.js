export default{
    template: `
    <div>
        <div v-if="songs.length == 0">
            <h1 style="text-align: center; margin-top: 2px; font-size:50px">No songs available in the Genre: {{details.genre_name}}</h1>  
        </div>

        <div v-else>
            <h1 style="text-align: center; margin-top: 2px; font-size:50px; margin-right:120px">Songs in the Genre: {{details.genre_name}}</h1>

            <div style="margin-top: 80px; text-align:center; margin-right:100px">
                <div v-if="msg" style="background-color:#b3b300; padding: 10px; border-radius: 5px">
                    <span style="font-weight:bold">{{ msg }}</span>
                    <button @click="clear_msg" style="margin-left: 5px; cursor: pointer; padding: 5px; border: none; border-radius: 3px">Close</button>
                </div>
            </div>

            <div style="text-align:center; margin-top:30px; margin-right:200px">
                <label style="margin-right:20px">Search Genre:</label>
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

            <div style="display:flex; justify-content:center; margin-right:150px">
                <table style="border-collapse:collapse; margin:25px; font-size:18px; min-width:350px; margin-top:50px">
                    <tr>
                        <th style="border:2px solid black; padding:10px; text-align:center">Index</th>
                        <th style="border:2px solid black; padding:10px; text-align:center">Song Name</th>
                        <th style="border:2px solid black; padding:10px; text-align:center">Album</th>
                        <th style="border:2px solid black; padding:10px; text-align:center">Artist</th>
                        <th style="border:2px solid black; padding:10px; text-align:center">Release Date</th>
                        <th style="border:2px solid black; padding:10px; text-align:center">Duration(Secs)</th>
                        <th style="border:2px solid black; padding:10px; text-align:center">Rating</th>
                    </tr>

                    <tr v-for="(song, index) in filtered_songs">
                        <td style="border:1px solid black; padding:10px; text-align:center">{{index+1}}</td>
                        <td style="border:1px solid black; padding:10px; text-align:center">{{song.song_name}}</td>
                        <td style="border:1px solid black; padding:10px; text-align:center">{{song.album}}</td>
                        <td style="border:1px solid black; padding:10px; text-align:center">{{song.f_name}} {{song.l_name}}</td>
                        <td style="border:1px solid black; padding:10px; text-align:center">{{song.release_date}}</td>
                        <td style="border:1px solid black; padding:10px; text-align:center">{{song.duration}}</td>
                        <td style="border:1px solid black; padding:10px; text-align:center">{{song.rating}}</td>
                        <td style="border:1px solid black; padding:10px; text-align:center"><button @click="play_song(song.song_id, song.album_id)">Play</button></td>   
                        <td style="border:1px solid black; padding:10px; text-align:center"><button @click="flag_song(song.song_id)">Flag</button></td>
                        <td style="border:1px solid black; padding:10px; text-align:center"><button @click="unflag_song(song.song_id)">Unflag</button></td>                                             
                    </tr>           
                </table>   
            </div> 
        </div>
        <div style="margin-top: 20px; text-align:center; margin-right: 100px">
            <button @click="go_back">See all genres</button>
        </div>           
    </div>
    `,

    data(){
        return{
            details:{
                genre_name: this.$route.query['genre_name']
            },
            songs:[],
            msg:[],
            search_value:"",
            rating:"",
            msg:"",
            user_id: localStorage.getItem('user_id')
        }
    },

    
    methods:{
        async get_genre_songs_details(){
            const response = await fetch("/genre_song_details", {
                method: "POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify(this.details)
            })
            const data = await response.json() 

            if (response.ok){
                console.log("success")
                this.songs = data.data  
                this.songs.forEach(song => {
                    song.release_date = new Date(song.release_date).toLocaleDateString("en-GB")
                })
            }
            else{
                this.msg = data.message
                console.log("failure")
            }
        },

        go_back(){
            this.$router.push("/user_genres")
        },

        play_song(song_id){
            this.$router.push({path:"/play_user_songs", query:{source:"genre" ,song_id:song_id, genre_name:this.details.genre_name} })
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
        filtered_songs(){
            const filtered_by_name =  this.songs.filter(song => song.song_name.includes(this.search_value.toLowerCase()))
        
        if (this.rating == ""){
            return filtered_by_name
        }  
        else{ 
            const [min, max] = this.rating.split(",").map(x => parseInt(x, 10))
            return filtered_by_name.filter(song => song.rating > min && song.rating <= max)
            }    
        },
    },

    mounted(){
        this.get_genre_songs_details()
    }
}
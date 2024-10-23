export default{
    template: `
    <div>
        <div v-if="details.album_id == undefined">
            <h1 style="text-align: center; margin-top: 2px; font-size:50px">No album selected</h1>  
        </div>

        <div v-else-if="songs.length == 0">
            <h1 style="text-align: center; margin-top: 2px; font-size:50px">No songs available in the album: {{album_name}}</h1>  
        </div>

        <div v-else>
            <h1 style="text-align: center; margin-top: 2px; font-size:50px; margin-right:120px">Songs in the album: {{album_name}}</h1>


            <div style="margin-top: 80px; text-align:center; margin-right:100px">
                <div v-if="msg" style="background-color:#b3b300; padding: 10px; border-radius: 5px">
                    <span style="font-weight:bold">{{ msg }}</span>
                    <button @click="clear_msg" style="margin-left: 5px; cursor: pointer; padding: 5px; border: none; border-radius: 3px">Close</button>
                </div>
            </div>

            <div style="text-align:center; margin-top:30px; margin-right:200px">
                <label style="margin-right:20px">Search Album:</label>
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
                        <th style="border:2px solid black; padding:10px; text-align:center">Genre</th>
                        <th style="border:2px solid black; padding:10px; text-align:center">Release Date</th>
                        <th style="border:2px solid black; padding:10px; text-align:center">Duration(Secs)</th>
                        <th style="border:2px solid black; padding:10px; text-align:center">Rating</th>
                    </tr>

                    <tr v-for="(song, index) in filtered_songs">
                        <td style="border:1px solid black; padding:10px; text-align:center">{{index+1}}</td>
                        <td style="border:1px solid black; padding:10px; text-align:center">{{song.song_name}}</td>
                        <td style="border:1px solid black; padding:10px; text-align:center">{{song.genre}}</td>
                        <td style="border:1px solid black; padding:10px; text-align:center">{{song.formatted_release_date}}</td>
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
            <button @click="go_back">See all albums</button>
        </div>           
    </div>
    `,

    data(){
        return{
            details:{
                album_id: this.$route.query['album_id']
            },
            songs:[],
            album_name:"",
            msg:[],
            search_value:"",
            rating:"",
            msg:"",
            user_id: localStorage.getItem('user_id')
        }
    },

    
    methods:{
        async get_album_songs_details(){
            const response = await fetch("/album_song_details", {
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
                    song.formatted_release_date = new Date(song.release_date).toLocaleDateString("en-GB")
                })
            }

            else{
                this.msg = data.message
                console.log("failure")
            }
        },

        async get_album_details(){
            const response = await fetch("/album_details", {
                method: "POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify(this.details)
            })
            const data = await response.json() 

            if (response.ok){
                this.album_name = data.album_name
                console.log("success")
            }
            else{
                this.msg = data.message
                console.log("failed")
            }
        },

        go_back(){
            this.$router.push("/user_albums")
        },
        play_song(song_id, album_id){
            this.$router.push({path:"/play_user_songs", query:{source:"album",song_id:song_id, album_id:album_id} })
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
            const filtered_by_name = this.songs.filter(song => song.song_name.includes(this.search_value.toLowerCase()))

            if (this.rating == ""){
                return filtered_by_name
            }  
            else{ 
                const [min, max] = this.rating.split(",").map(x => parseInt(x, 10))
                return filtered_by_name.filter(song => song.rating > min && song.rating <= max)
            }    
        }
    },

    mounted(){
        this.get_album_songs_details(),
        this.get_album_details()
    }
}
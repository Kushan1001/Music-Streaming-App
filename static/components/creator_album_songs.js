export default{
    template: `
    <div>
        <div v-if="details.album_id == undefined">
            <h1 style="text-align: center; margin-top: 2px; font-size:50px">No album selected</h1>  
        </div>

        <div v-else-if="songs.length == 0">
            <h1 style="text-align: center; margin-top: 2px; font-size:50px">No songs uploaded by the creator in {{album_name}}</h1>  
        </div>

        <div v-else>
            <h1 style="text-align: center; margin-top: 2px; font-size:50px; margin-right:120px">Songs uploaded in {{album_name}}</h1>

            <div style="text-align:center; margin-top:100px">
                <div v-if="msg" style="background-color:#b3b300; padding: 10px; border-radius: 5px">
                    <span style="font-weight: bold">{{ msg }}</span>
                    <button @click="clear_msg" style="margin-left: 5px; cursor: pointer; padding:5px; border: none; border-radius: 3px">Close</button>
                </div>
            </div>

            <div style="text-align:center; margin-top:30px; margin-right:200px">
                <label style="margin-right:20px">Search Song:</label>
                <input type="search" v-model="search_value">
            </div>

            <div style="display:flex; justify-content:center; margin-top:20px; margin-right:80px">
                <table style="border-collapse:collapse; margin:25px; font-size:18px; min-width:350px">
                    <tr>
                        <th style="border:2px solid black; padding:10px; text-align:center">Index</th>
                        <th style="border:2px solid black; padding:10px; text-align:center">Song Name</th>
                        <th style="border:2px solid black; padding:10px; text-align:center">Genre</th>
                        <th style="border:2px solid black; padding:10px; text-align:center">Release Date</th>
                        <th style="border:2px solid black; padding:10px; text-align:center">Duration(Secs)</th>
                        <th style="border:2px solid black; padding:10px; text-align:center">Rating</th>
                        <th style="border:2px solid black; padding:10px; text-align:center">Plays</th>
                        <th style="border:2px solid black; padding:10px; text-align:center">Flagged By</th>
                    </tr>

                    <tr v-for="(song, index) in filtered_songs">
                        <td style="border:1px solid black; padding:10px; text-align:center">{{index+1}}</td>
                        <td style="border:1px solid black; padding:10px; text-align:center">{{song.song_name}}</td>
                        <td style="border:1px solid black; padding:10px; text-align:center">{{song.genre}}</td>
                        <td style="border:1px solid black; padding:10px; text-align:center">{{song.formatted_release_date}}</td>
                        <td style="border:1px solid black; padding:10px; text-align:center">{{song.duration}}</td>
                        <td style="border:1px solid black; padding:10px; text-align:center">{{song.rating}}</td>
                        <td style="border:1px solid black; padding:10px; text-align:center">{{song.counter}}</td>
                        <td style="border:1px solid black; padding:10px; text-align:center">{{song.flagged}} users</td>
                        <td style="border:1px solid black; padding:10px; text-align:center"><button @click="play_song(song.song_id, song.album_id)">Play</button></td>
                        <td style="border:1px solid black; padding:10px; text-align:center"><button @click="edit_song(song.song_id, song.album_id)">Edit</button></td>
                        <td style="border:1px solid black; padding:10px; text-align:center"><button @click="delete_song(song.song_id)">Delete</button></td>
                        <td style="border:1px solid black; padding:10px; text-align:center"><button @click="move_song(song.song_id)">Move</button></td>
                    </tr>           
                </table>   
            </div> 
        </div>
        <div style="margin-top: 20px; text-align:center">
            <button @click="go_back">Go to uploaded albums</button>
        </div>           
    </div>
    `,

    data(){
        return{
            details:{
                album_id: this.$route.query['album_id'],
                user_id: localStorage.getItem('user_id')
            },
            songs:[],
            album_name:"",
            search_value:"",
            msg: this.$route.query['msg'],
            album_id: this.$route.query['album_id']
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
            this.$router.push("/uploaded_creator_albums")
        },
        play_song(song_id, album_id){
            this.$router.push({path:"/play_creator_songs", query:{source:"album",song_id:song_id, album_id:album_id} })
        },

        edit_song(song_id, album_id){
            this.$router.push({path:"/edit_song_details", query:{song_id:song_id, album_id:album_id, source:"album"} })
        },

        move_song(song_id){
            this.$router.push({path:"move_song", query:{song_id:song_id} })
        },

        async delete_song(song_id){
            song_id = song_id
            const response = await fetch("/delete_song", {
                method:"POST",
                headers: {
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({"song_id": song_id, "user_id": this.details.user_id})
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
        clear_msg(){
            this.msg = null
            this.$router.push({path: "/creator_album_songs", query:{album_id: this.album_id} })
        }
    },

    computed:{
        filtered_songs(){
            return this.songs.filter(song => song.song_name.includes(this.search_value.toLowerCase()))
        }
    },

    mounted(){
        this.get_album_songs_details(),
        this.get_album_details()
    }
}
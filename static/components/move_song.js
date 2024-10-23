export default{
    template:`
        <div>
            <div>
                <h1 style="text-align: center; margin-top: 2px; font-size:50px">Move Song</h1>
            </div>

            <div style="margin-top: 150px; text-align: center;">
                <div v-if="this.msg" style="background-color: #f0f0f0; padding: 10px; border-radius: 5px;">
                    <span style="color: red; font-weight: bold;">{{msg}}</span>
                    <button @click="clear_msg" style="margin-left: 5px; padding: 5px 10px; background-color: brown; color: #fff; border: none; border-radius: 3px; cursor: pointer;">Close</button>
                </div>
            </div>

            <div style="margin-left:550px; margin-top:20px">
                    <label style="font-size:20px">Available Albums:</label>
                    <select v-model="updated_album_id">
                        <option :value="album.album_id" v-for="album in albums">{{album.album_name}}</option>
                    </select>
                    <span>
                        <button @click="move_song">Move Song</button>
                        <button @click="go_back">Select another song</button>
                    </span>
                </div>
            </div>
        </div>
    `,

    data(){
        return{
            details:{
               user_id: localStorage.getItem('user_id')
            },
            song_id:this.$route.query['song_id'],
            albums: "",
            msg:"",
            updated_album_id: ""
        }
    },

    methods:{
        async get_albums(){
            const response = await fetch("/creator_albums", {
                method: "POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify(this.details)
            })
            const data = await response.json() 

            if (response.ok){
                this.albums = data.data
                console.log("success")
            }
            else{
                this.msg = data.message
                console.log("failure")
            }
        },

        async move_song(){
            const response = await fetch("/move_song", {
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({"song_id": this.song_id,
                                      "updated_album_id": this.updated_album_id})
            })
            const data = await response.json()

            if (response.ok){
                console.log('sucess')
                this.$router.push({path: "/uploaded_creator_songs", query:{msg: "Song moved successfully"} })
            }
            else{
                console.log("failed")
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
        this.get_albums()
    }
}
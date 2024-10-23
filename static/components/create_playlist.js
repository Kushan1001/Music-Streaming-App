export default{
    template:`
        <div>
            <h1 style="text-align: center; margin-top: 2px; font-size:50px">Create a Playlist</h1>

            <div style="margin-top: 80px; text-align:center">
                <div v-if="msg">
                    <span>{{ msg }}</span>
                    <button @click="clear_msg" style="margin-left:5px">Close</button>
                </div>
            </div>

            <div style="text-align: center; margin-top: 20px">
                <label style="font-size:20px">Playlist Name:</label>
                <input v-model="details.playlist_name">
                <button @click="create_playlist">Create</button>
                <button @click="see_playlists">See all playlists</button>        
            </div>

        </div>
    `,

    data(){
        return{
            details:{
                playlist_name:"",
                user_id: localStorage.getItem("user_id")
            },
            msg:""
        }
    },

    methods:{
        async create_playlist(){
            const response = await fetch('/create_playlist', {
                method : "POST",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify(this.details)

            })

            const data =  await response.json()
            if (response.ok){
                this.$router.push("/user_playlist")     
         }
            else{
                this.msg = data.message
            }

        },

        see_playlists(){
            this.$router.push("/user_playlist")
        },

        clear_msg(){
            this.msg = null
        }
    }
}
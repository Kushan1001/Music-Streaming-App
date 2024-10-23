export default{
    template:`
        <div>
            <h1 style="text-align: center; margin-top: 2px; font-size:50px">User Dashboard</h1>
            <h2 style="margin-left: 20px; margin-top: 2px; font-size:40px">Welcome: {{username}}</h2>

            <div style="font-size:30px; margin-top:70px; margin-left:30px">
                <button style="border-radius:5px; width:200px" @click="go_to_songs">Songs</button>
            </div>

            <div style="font-size:30px; margin-top:40px; margin-left:30px">
                <button style="border-radius:5px; width:200px" @click="go_to_playlists">Playlists</button>
            </div>

            <div style="font-size:30px; margin-top:40px; margin-left:30px">
                <button style="border-radius:5px; width:200px" @click="go_to_albums">Albums</button>
            </div>

            <div style="font-size:30px; margin-top:40px; margin-left:30px">
                <button style="border-radius:5px; width:200px" @click="go_to_genres">Genres</button>
            </div>

            <div style="font-size:30px; margin-top:20px; margin-left:10px; position:absolute; top:0; right:30px">
                <button style="border-radius:5px" @click="logout">Logout</button>
            </div>
        </div>
        `,

    data(){
        return{
            details:{
                user_id: localStorage.getItem('user_id')
            },
            username: localStorage.getItem('username')
        }
    },

    methods:{
        go_to_songs(){
            this.$router.push("/user_songs")
        },

        go_to_playlists(){
            this.$router.push("/user_playlist")
        },

        go_to_albums(){
            this.$router.push("/user_albums")
        },

        go_to_genres(){
            this.$router.push("/user_genres")
        },

        logout(){
            localStorage.removeItem('auth-token')
            localStorage.removeItem('role')
            localStorage.removeItem('user_id')
            localStorage.removeItem('username')

            this.$router.push("/signin")
        }
    }
}
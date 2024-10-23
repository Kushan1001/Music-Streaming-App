export default{
    template: `
        <div>
            <h1 style="text-align: center; margin-top: 2px; font-size:50px">Admin Dashboard</h1>
            <h2 style="margin-left: 20px; margin-top: 2px; font-size:35px">Welcome: {{username}}</h2>
            <h2 style="margin-left: 20px; margin-top: 30px; font-size:30px">App Statistics</h2>

            <div style="display: flex; flex-wrap: wrap; justify-content: space-around">
                <div style="height:150px; width:200px; border: solid 4px black; padding:10px; border-radius:10px">
                    <p style="text-align: center; font-weight:bold">Registered Users</p>
                    <p style="text-align: center; font-weight:bold; margin-top:35px">{{registered_users}}</p>
                </div >

                <div style="height:150px; width:200px; border: solid 4px black; padding:10px; border-radius:10px">
                    <p style="text-align: center; font-weight:bold">Registered Creators</p>
                    <p style="text-align: center; font-weight:bold; margin-top:35px">{{registered_creators}}</p>
                </div>

                <div style="height:150px; width:200px; border: solid 4px black; padding:10px; border-radius:10px">
                    <p style="text-align: center; font-weight:bold">Songs Uploaded</p>
                    <p style="text-align: center; font-weight:bold; margin-top:35px">{{songs_uploaded}}</p>
                </div>

                <div style="height:150px; width:200px; border: solid 4px black; padding:10px; border-radius:10px">
                    <p style="text-align: center; font-weight:bold">Albums Uploaded</p>
                    <p style="text-align: center; font-weight:bold;margin-top:35px">{{albums_uploaded}}</p>

                </div>

                <div style="height:150px; width:200px; border: solid 4px black; padding:10px; border-radius:10px">
                    <p style="text-align: center; font-weight:bold">Flagged Songs</p>
                    <p style="text-align: center; font-weight:bold; margin-top:35px">{{flagged_songs}}</p>
                </div>
            </div>

            <div style="font-size:25px; margin-top:90px; margin-left:10px">
                <button style="border-radius:5px" @click="detailed_app_stats">Detailed App Statistics</button>
            </div>

            <div style="font-size:25px; margin-top:20px; margin-left:10px">
                <button style="border-radius:5px" @click="see_flagged_songs">Flagged Songs</button>
            </div>

            <div style="font-size:25px; margin-top:20px; margin-left:10px; position:absolute; top:0; right:30px">
                <button style="border-radius:5px" @click="logout">Logout</button>
            </div>

        </div>`,
    
    data(){
        return{
            username:"",
            registered_users:"",
            registered_creators:"",
            songs_uploaded:"",
            albums_uploaded:"",
            flagged_songs:""
        }
    },

    methods:{
        async get_admin_details(){
            const response = await fetch("/admin_details")
            const data = await response.json()

            if (response.ok){
                this.username = data.admin_name
                this.registered_creators = data.total_creators
                this.registered_users = data.total_users
                this.songs_uploaded = data.total_songs
                this.albums_uploaded =data.total_albums
                this.flagged_songs = data.flagged_songs
            }
        },
        detailed_app_stats(){
            this.$router.push("/detailed_app_stats")
        },
        
        see_flagged_songs(){
            this.$router.push("/see_flagged_songs")
        },
        logout(){
            localStorage.removeItem('auth-token')
            localStorage.removeItem('role')
            localStorage.removeItem('user_id')
            localStorage.removeItem('username')

            this.$router.push("/signin")
        }
    },

    mounted(){
        this.get_admin_details()
    }
}
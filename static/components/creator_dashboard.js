export default{
    template: `
        <div>
            <h1 style="text-align: center; margin-top: 2px; font-size:50px">Creator Dashboard</h1>
            <h2 style="margin-left: 20px; margin-top: 2px; font-size:35px">Welcome: {{username}}</h2>
            <h2 style="margin-left: 20px; margin-top: 30px; font-size:30px">Creator Statistics</h2>

            <div style="display: flex; flex-wrap: wrap; justify-content: space-around">
                <div style="height:150px; width:200px; border: solid 4px black; padding:10px; border-radius:10px">
                    <p style="text-align: center; font-weight:bold">Songs Uploaded</p>
                    <p style="text-align: center; font-weight:bold; margin-top:35px">{{songs_uploaded}}</p>
                </div >

                <div style="height:150px; width:200px; border: solid 4px black; padding:10px; border-radius:10px">
                    <p style="text-align: center; font-weight:bold">Albums Uploaded</p>
                    <p style="text-align: center; font-weight:bold; margin-top:35px">{{albums_uploaded}}</p>
                </div>

                <div style="height:150px; width:200px; border: solid 4px black; padding:10px; border-radius:10px">
                    <p style="text-align: center; font-weight:bold">Most Streamed Song</p>
                    <p style="text-align: center; font-weight:bold; margin-top:35px">{{most_streamed_song}}</p>
                </div>

                <div style="height:150px; width:200px; border: solid 4px black; padding:10px; border-radius:10px">
                    <p style="text-align: center; font-weight:bold">Highest Rated Song</p>
                    <p style="text-align: center; font-weight:bold; margin-top:35px">{{highest_rated_song}}</p>

                </div>

                <div style="height:150px; width:200px; border: solid 4px black; padding:10px; border-radius:10px">
                    <p style="text-align: center; font-weight:bold">Flagged Songs</p>
                    <p style="text-align: center; font-weight:bold; margin-top:35px">{{flagged_songs}}</p>
                </div>

                <div style="height:150px; width:200px; border: solid 4px black; padding:10px; border-radius:10px">
                    <p style="text-align: center; font-weight:bold">Avg Creator Rating</p>
                    <p style="text-align: center; font-weight:bold; margin-top:30px">{{creator_rating}}</p>
                </div>
            </div>

            <div style="font-size:25px; margin-top:70px; margin-left:10px">
                <button style="border-radius:5px" @click="see_all_songs">See All Songs</button>
            </div>

            <div style="font-size:25px; margin-top:15px; margin-left:10px">
                <button style="border-radius:5px" @click="see_all_albums">See All Albums</button>
            </div>

            <div style="font-size:25px; margin-top:15px; margin-left:10px">
                <button style="border-radius:5px" @click="create_album">Create Album</button>
            </div>

            <div style="font-size:25px; margin-top:15px; margin-left:10px">
                <button style="border-radius:5px" @click="upload_song">Upload A Song</button>
            </div>

            <div style="font-size:25px; margin-top:15px; margin-left:10px">
                <button style="border-radius:5px" @click="download_details">Download Details</button>
            </div>

            <div style="font-size:25px; margin-top:20px; margin-left:10px; position:absolute; top:0; right:30px">
                <button style="border-radius:5px" @click="logout">Logout</button>
            </div>

        </div>`,

    data(){
        return{
            details:{
                user_id: localStorage.getItem('user_id')
            },
            songs_uploaded: "",
            albums_uploaded: "",
            flagged_songs: "",
            creator_rating: "",
            most_streamed_song: "",
            highest_rated_song: "",
            username: localStorage.getItem('username')
        }
    },

    methods:{
        async get_creator_details(){
            const response = await fetch("/creator_details", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(this.details)
            })
            const data = await response.json()

            if (response.ok){
                this.songs_uploaded = data.songs_uploaded
                this.albums_uploaded = data.albums_uploaded
                this.flagged_songs = data.flagged_songs
                this.creator_rating = data.creator_rating
                this.most_streamed_song = data.most_streamed_song
                this.highest_rated_song = data.highest_rated_song
                console.log("success")
            }
            else{
                console.log("failed")
            }
        },

        logout(){
            localStorage.removeItem('auth-token')
            localStorage.removeItem('role')
            localStorage.removeItem('user_id')
            localStorage.removeItem('username')

            this.$router.push("/signin")
        },

        upload_song(){
            this.$router.push("/select_album")
        },

        create_album(){
            this.$router.push("/create_album")
        },

        see_all_songs(){
            this.$router.push("/uploaded_creator_songs")
        },

        see_all_albums(){
            this.$router.push("/uploaded_creator_albums")
        },

        async download_details(){
            const response = await fetch('/download_csv', {
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(this.details)
            })
            const data = await response.json()

            if (response.ok){
                const task_id = data['task_id']
                const interval = setInterval(async ()=>{
                    const csv_response = await fetch(`/get_csv/${task_id}`)
                    if (csv_response.ok){
                        clearInterval(interval)
                        window.location.href = `/get_csv/${task_id}`
                    }
                }, 1000)
            }   
        }

    },

    mounted(){
        this.get_creator_details()
    }
}
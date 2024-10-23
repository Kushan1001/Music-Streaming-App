export default{
    template:`
        <div>
            <h1 style="text-align: center; margin-top: 2px; font-size:50px">App Statisitcs</h1>

            <div style="font-size:25px; margin-top:90px; margin-left:40px">
                <button style="border-radius:5px; width:280px" @click="genre_songs_chart">See songs by genre</button>
            </div>

            <div style="font-size:25px; margin-top:30px; margin-left:40px">
                <button style="border-radius:5px; width:280px" @click="songs_rating_chart">See songs rating</button>
            </div>

            <div style="font-size:25px; margin-top:30px; margin-left:40px">
                <button style="border-radius:5px; width:280px" @click="albums_rating_chart">See albums rating</button>
            </div>

            <div style="font-size:25px; margin-top:30px; margin-left:40px">
                <button style="border-radius:5px; width:280px" @click="creators_rating_chart">See creators rating</button>
            </div>

            <div style="margin-left:40px; margin-top:50px; font-size:18 px">
                <button @click="go_back">Go to admin dashboard</button>
            </div>
        </div>
    `,

    methods:{
        genre_songs_chart(){
            this.$router.push("/genre_songs_chart")
        },

        songs_rating_chart(){
            this.$router.push("/songs_rating_chart")
        },

        albums_rating_chart(){
            this.$router.push("/albums_rating_chart")
        },

        creators_rating_chart(){
            this.$router.push("/creators_rating_chart")
        },

        go_back(){
            this.$router.push("/admin_dashboard")
        }
    }
}
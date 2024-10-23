export default{
    template:`
        <div>
            <h1 style="text-align: center; margin-top: 2px; font-size:50px">Songs in different genres</h1>
            <div style="text-align:center; margin-top:50px">
                <img :src="image_path" alt="barchart">
            </div>

            <div style="text-align:center; margin-top:10px">
                <button @click="go_back">See another statistic</button>
            </div>
        </div>
    `,

    data(){
        return{
            image_path:""
        }
    },

    methods:{
        async get_image(){
            const response = await fetch("/get_songs_by_genre_chart")
            const data = await response.json()

            if (response.ok){
                this.image_path = data.path
                console.log('success')
            }
            else{
                console.log(failed)
            }   
        },
        go_back(){
            this.$router.push("/detailed_app_stats")
        }
    },

    mounted(){
        this.get_image()
    }

}
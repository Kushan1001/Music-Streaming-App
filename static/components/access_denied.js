export default{
    template: `
    <div>
        <h1 style="text-align: center; margin-top: 150px">You do not have access to this page for your given role</h1>
        <button style="text-align: center; margin-top: 20px; margin-left: 650px" @click="go_to_homepage">Go to homepage
        </button>
    </div>
    `,

    methods:{
        go_to_homepage(){
            this.$router.push("/")
        }
    }

}
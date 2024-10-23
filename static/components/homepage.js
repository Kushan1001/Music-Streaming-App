export default{
    template: `
    <div>
        <h1 style="text-align: center; margin-top: 2px; font-size:60px">Music Streaming App</h1>

        <h2 style="text-align: center; margin-top: 100px; font-size:40px">Go To</h2>

        <div style="text-align: center; margin-top:50px">
            <span><button style="font-size:30px" @click="go_to_admin">Admin</button> 
            <button style="font-size:30px; margin-left:20px" @click="go_to_user">User</button> 
            <button style="font-size:30px; margin-left:20px" @click="go_to_creator">Creator</button></span>
        </div>

        <div style="text-align: center; margin-top:50px">
            <span><button style="font-size:20px" @click="signup">SignUp</button> 
            <button style="font-size:20px" @click="signin">Go to Login</button></span>
        </div>
    </div>
    `,

    methods: {
        go_to_admin(){
            this.$router.push("/admin_dashboard")
        },

        go_to_user(){
            this.$router.push("/user_dashboard")
        },

        go_to_creator(){
            this.$router.push("/creator_dashboard")
        },
        signin(){
            this.$router.push("/signin")
        },
        signup(){
            this.$router.push("/signup")
        }

    }

}
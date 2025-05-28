import Home from "~/pages/Home/Home"
import Login from "~/pages/Login/Login"
import Users from "~/pages/Users/Users"
import Songs from "~/pages/Songs/Songs"
import Genres from "~/pages/Genres/Genres"
import Artists from "~/pages/Artists/Artists"


const publicRouter = [
    {path: '/', component: Home},
    {path: '/users', component: Users},
    {path: '/songs', component: Songs},
    {path: '/genres', component: Genres},
    {path: '/artists', component: Artists},
    {path: '/login', component: Login, layout: null},
]

const privateRouter = [

]

export { publicRouter, privateRouter }
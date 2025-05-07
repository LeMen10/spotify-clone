// import Message from "~/pages/Message/Message"
import Home from "~/pages/Home/Home"
import Login from "~/pages/Login/Login"
import MomoResultPage from "~/pages/MomoResultPage/MomoResultPage"
import Register from "~/pages/Register/Register"
import SearchResults from "~/pages/SearchResults/SearchResults"
import Playlist from "~/pages/Playlist/Playlist"

const publicRouter = [
    {path: '/login', component: Login, layout: null},
    {path: '/', component: Home},
    {path: '/register', component: Register, layout: null},
    {path: '/momo', component: MomoResultPage, layout: null},
    {path: '/search', component: SearchResults},
    {path: '/playlist/:id', component: Playlist}
]

const privateRouter = [

]

export { publicRouter, privateRouter }
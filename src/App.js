import {Route,Routes} from "react-router-dom"
import Edit from "./Edit";
import LoginForm from "./LoginForm";


function App(){
  return(
    
    <Routes>
      <Route path="/"element={<LoginForm/>}/>
      <Route path="/edit" element={<Edit/>}></Route>
    </Routes>
    
  )
}
export default App;
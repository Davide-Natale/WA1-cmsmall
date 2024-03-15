import { useContext } from "react";
import { Container, Spinner } from "react-bootstrap";
import MyNavbar from "./Navbar";
import MyMain from "./Main";
import AppContext from "../AppContext";
import ErrorView from "./Error";

function HomeRoute(props) {
    const context = useContext(AppContext);
    const loadingState = context.loadingState;
    const handleErrorState = context.handleErrorState;

    return(
        <>
            {handleErrorState.errMsg ? 
                <ErrorView /> : 
                <>
                    { loadingState.loading ? <Container className='my-5 text-center'> <Spinner variant='primary' /> </Container> :
                        <>
                            <MyNavbar type={props.type} />
                            <MyMain type={props.type} /> 
                        </>
                    }
                </>
            }
        </>    
    );
} 

export default HomeRoute;
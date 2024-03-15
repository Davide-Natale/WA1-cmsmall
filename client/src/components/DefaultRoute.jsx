import { useContext } from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AppContext from "../AppContext";

function DefaultRoute() {
    const navigate = useNavigate();
    const context = useContext(AppContext);
    const siteNameState = context.siteNameState;
    const loadingState = context.loadingState;
    const listOfPagesState = context.listOfPagesState;

    return(
        <Container fluid>
            <Row className="my-5">
                <Col></Col>
                <Col>
                    <Card style={{width: '100%'}}>
                        <Card.Header>
                            <Card.Title as='h1'>No data here...</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Card.Subtitle as='h4'>This is not the route you are looking for!</Card.Subtitle>
                            <Row className="my-2 text-center">
                                <Col>
                                    <Button className='rounded-pill' variant="dark" onClick={() => {
                                            loadingState.updateLoading(true);
                                            siteNameState.updateFetchSiteName(true);
                                            listOfPagesState.updateFetchPages('front-office');
                                            navigate('/');
                                        }}>
                                        Home
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
                <Col></Col>
            </Row>
        </Container>
      
    );
  }

export default DefaultRoute;
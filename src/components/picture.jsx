import React from 'react';
import gallery from '../models/gallery';
import ipfs from '../controllers/ipfs';
import web3 from '../controllers/web3';
import events from '../controllers/events';
import { Button, Card, Icon, Image, Loader, Comment, Form, Modal, Grid } from 'semantic-ui-react';


export class PictureList extends React.Component {
    state = {
        data: [],
        count: 0
    }

    async componentWillMount(){        
        this.onEventAddPicture = events.addListener(
            "picture-added", this.onPictureAdded.bind(this));

        await this.requestPictures();

        setInterval(this.requestPicturesInterval.bind(this), 10000);
    }

    onPictureAdded(item){
        const { data } = this.state;
        data.splice(0, 0, item);
        this.setState({ data });
    }

    requestPicturesInterval(){
        this.requestPictures().then(function(){ });
    }

    async requestPictures(){
        let count = await gallery.methods.getCount().call();
        let data = [];
        count = parseInt(count);

        for (var i = count - 1; i >= 0; i--){
            let picture = await gallery.methods.getPhotoByIndex(i).call();
            if (picture){
                data.push(picture);
            }
        }

        this.setState({ count, data });
    }

    renderList(){
        const { data, count } = this.state;

        if (!count) {
            return (
                <div>Nenhuma imagem enviada! Seja o primeiro!</div>
            )
        }

        return data.map(function(item, index){
            return <Picture data={item} key={index} />
        });
    }

    render() {
        const { data } = this.state;

        return (
            <Card.Group itemsPerRow={4}>{this.renderList()}</Card.Group>
        );
    }
}

export class Picture extends React.Component {
    onClick(){
        events.emit("picture-click", this.props.data);
    }

    render() {
        return (
            <Card onClick={this.onClick.bind(this)}>
                <Image wrapped src={`https://ipfs.io/ipfs/${this.props.data["1"]}`} />
                <Card.Content extra>
                    <a><Icon name="heart" /> ({this.props.data["4"]}) | <Icon name="comment" /> {this.props.data["5"]} comments</a>
                </Card.Content>
            </Card>
        )
    }
}

export class PictureModal extends React.Component {
    state = {
        loading: false
    }

    async onSendHeart(){
        let accounts = await web3.eth.getAccounts();
        this.setState({ loading: true });
        try{
            await gallery.methods
                .sendHeartToPicture(this.props.data["1"], 1)
                .send({from: accounts[0]});
        }catch(e){
            console.log(e);
        }
        this.setState({ loading: false });
    }

    render(){
        return (
            <Modal dimmer={true} open={this.props.open} onClose={this.props.close}>
                <Modal.Content>
                    <Grid>
                        <Grid.Column width={10}>
                            <Image wrapped src={`https://ipfs.io/ipfs/${this.props.data["1"]}`}/>
                        </Grid.Column>
                        <Grid.Column width={6}>
                            {this.props.data["2"]}
                            <div><Button
                                onClick={this.onSendHeart.bind(this)}
                                style={{marginTop: "20px"}}
                                loading={this.state.loading}><Icon name="heart" /> ({this.props.data["4"]}) Enviar um coração</Button>
                            </div>
                            <Modal.Description>
                                <Comments reference={this.props.data["1"]}/>
                                <CommentForm reference={this.props.data["1"]} />
                            </Modal.Description>
                        </Grid.Column>
                    </Grid>
                </Modal.Content>
            </Modal>
        );
    }
}

export class Comments extends React.Component {
    state = {
        count: 0,
        data: []
    }

    async componentWillMount(){
        let data = [];
        let count = await gallery.methods.getCommentCount(this.props.reference).call();
        count = parseInt(count);
    
        for (var i = 0; i < count; i++){
            let item = await gallery.methods.getCommentByIndex(this.props.reference, i).call();
            if(item){
                data.push(item);
            }
        }

        this.setState({ count, data });
    }

    renderList(){
        const { data } = this.state;

        if (!this.state.count){
            return <div>Nenhum comentário registrado!</div>
        }

        return data.map((item, index) => {
            return <CommentItem data={item} key={index}/>
        });
    }

    render(){
        return (
            <Comment.Group style={{marginTop: "20px"}}>{this.renderList()}</Comment.Group>
        );
    }
}

export class CommentItem extends React.Component {
    render() {
        return (
            <Comment>
                <Comment.Content>
                    <Comment.Author>{this.props.data["0"]}</Comment.Author>
                    <Comment.Text>{this.props.data["1"]}</Comment.Text>
                </Comment.Content>
            </Comment>
        )
    }
}

export class CommentForm extends React.Component {
    state = {
        message: "",
        loading: false
    }

    isValid(){
        if (!this.state.message.length){
            return false;
        }

        return true;
    }

    async onSubmit(e){
        e.preventDefault();

        let accounts = await web3.eth.getAccounts();

        if (this.isValid()){
            this.setState({ loading: true });

            try{
                await gallery.methods
                    .createComment(this.props.reference, this.state.message)
                    .send({from: accounts[0]});
            }catch(e){
                console.log(e);
            }

            this.setState({ loading: false});
        }
    }

    render() {
        return (
            <Form onSubmit={this.onSubmit.bind(this)}>
                <Form.Group inline>
                    <Form.Field control={Form.Input} action="Comentar" loading={this.state.loading} onChange={e => {this.setState({message:e.target.value})}}/>
                </Form.Group>
            </Form>
        );
    }
}

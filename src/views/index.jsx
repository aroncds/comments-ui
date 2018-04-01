import React from 'react';
import { Menu, Card, Container, Icon } from 'semantic-ui-react';
import { Picture, PictureModal, PictureList } from '../components/picture';
import { Upload } from '../components/upload';
import { Store } from '../components/store';
import events from '../controllers/events';
import gallery from '../models/gallery';
import heart from '../models/heart';
import web3 from '../controllers/web3';


class Header extends React.Component {
    state = {
        open: false,
        openBuy: false,
        count: 0,
        balance: 0
    }

    async componentWillMount(){
        let accounts = await web3.eth.getAccounts();
        let balance = await heart.methods.balanceOf(accounts[0]).call();
        let count = await gallery.methods.getMyPhotoCount().call({from: accounts[0]});
        balance = parseInt(balance) / Math.pow(10, 8);
        this.setState({ balance, count });
    }

    show(state){
        return () => {var data = {}; data[state] = true; this.setState(data)};
    }

    close(state){
        return () => {var data = {}; data[state] = false; this.setState(data)};
    }

    render() {
        const { balance, count } = this.state;

        return [
            <Menu style={{"marginTop": '20px'}} secondary key={0}>
                <Menu.Item header><Icon name="comment"/> Comments</Menu.Item>
                <Menu.Menu position="right">
                    <Menu.Item><a onClick={this.show("openBuy")}><Icon name="heart"/>({balance})</a></Menu.Item>
                    <Menu.Item><Icon name="image" />({count})</Menu.Item>
                    <Menu.Item><a onClick={this.show("open")}><Icon name="plus" /></a></Menu.Item>
                </Menu.Menu>
            </Menu>,
            <Upload open={this.state.open} close={this.close("open")} key={1} />,
            <Store open={this.state.openBuy} close={this.close("openBuy")} key={2} />
        ];
    }
}

class Content extends React.Component {
    state = {
        modal: false,
        modalData: ""
    }

    componentDidMount(){
        this.onModalOpen = events.addListener("picture-click", this.modalOpen.bind(this));
    }

    modalOpen(data){
        this.setState({ modalData: data, modal: true });
    }

    modalClose(){
        this.setState({ modal: false });
    }

    render(){
        const { modal, modalData } = this.state;

        return (
            <div>
                <PictureList />
                <PictureModal open={modal} data={modalData} close={this.modalClose.bind(this)} />
            </div>
        );
    }
}

export default class Index extends React.Component {

    render() {
        return (
            <Container>
                <Header/>
                <Content/>
            </Container>
        );
    }
}

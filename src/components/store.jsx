import React from 'react';
import heart from '../models/heart';
import gallery from '../models/gallery';
import web3 from '../controllers/web3';
import { Form, Modal, Grid } from 'semantic-ui-react';


export class Store extends React.Component {
    state = {
        amount: 0,
        price: 0
    }

    async componentWillMount(){
        const price = await gallery.methods.price();
        this.setState({ price });
    }

    render() {
        return (
            <Modal open={this.props.open} onClose={this.props.close} dimmer={"blurring"}>
                <Modal.Header>Corações</Modal.Header>
                <Modal.Content>
                    <Grid>
                        <Grid.Column width={8}><Buy /></Grid.Column>
                        <Grid.Column width={8}><Sell /></Grid.Column>
                    </Grid>
                </Modal.Content>
            </Modal>
        )
    }
}

class Sell extends React.Component {
    state = {
        amount: 0,
        amountMax: 0,
        price: 0,
        commision: 0
    };

    async componentWillMount(){
        let accounts = await web3.eth.getAccounts();
        let price = await gallery.methods.price().call();
        let commision = await gallery.methods.commision().call();
        let amountMax = await heart.methods.balanceOf(accounts[0]).call();

        price = web3.utils.fromWei(price, "ether");
        commision = web3.utils.fromWei(commision, "ether");

        this.setState({ price, commision, amountMax });
    }

    async onSubmit(){

    }

    render() {
        let { price, amount, commision } = this.state;
        commision = parseFloat(commision);
        amount = parseFloat(amount);
        price = parseFloat(price - commision);
        return (
            <Form onSubmit={this.onSubmit.bind(this)}>
                <div>Preço: {this.state.price - this.state.commision} ETH</div>
                <div>Total: {price * amount} ETH</div>
                <Form.Input
                    action="Vender"
                    placeholder="Quantidade para comprar..."
                    value={this.state.amount}
                    onChange={(e) => {this.setState({amount: e.target.value})}}/>
            </Form>
        );
    }
}

class Buy extends React.Component {
    state = {
        amount: 0,
        price: 0
    }

    async componentWillMount(){
        let price = await gallery.methods.price().call();
        price = web3.utils.fromWei(price, "ether");
        this.setState({ price });
    }

    async onSubmit(e){
        e.preventDefault();

        let { price, amount } = this.state;
        let accounts = await web3.eth.getAccounts();

        try{
            price = parseInt(price);
            amount = parseInt(amount);

            await gallery.methods
                .buyHeart(this.state.amount)
                .send({from: accounts[0], value: price * amount});
        }catch(e){
            console.log(e);
        }

    }

    render() {
        let { price, amount } = this.state;
        amount = parseFloat(amount);
        price = parseFloat(price);
        return (
            <Form onSubmit={this.onSubmit.bind(this)}>
                <div>Preço: {this.state.price} ETH</div>
                <div>Total: {price * amount} ETH</div>

                <Form.Input
                    action="Comprar"
                    value={this.state.amount}
                    placeholder="Quantidade para comprar..."
                    onChange={(e) => {this.setState({amount: e.target.value})}}/>
            </Form>
        );
    }
}

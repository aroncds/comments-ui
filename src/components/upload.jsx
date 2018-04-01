import React from 'react';
import ipfs from '../controllers/ipfs';
import web3 from '../controllers/web3';
import gallery from '../models/gallery';
import buffer from 'buffer';
import events from '../controllers/events';

import { Modal, Form, Button } from 'semantic-ui-react';


function uploadIpfs(file, callback) {
    const reader = new FileReader();
    reader.onloadend = function() {
        const buf = buffer.Buffer(reader.result);
        ipfs.files.add(buf, (err, result) => {
            if(err) {
                console.error(err)
                return
            }
            callback(result[0].hash);
        })
    }
    reader.readAsArrayBuffer(file);
}


export class Upload extends React.Component {
    state = {
        file: null,
        description: "",
        loading: false
    }

    onChangeFile(e){
        this.setState({ file: e.target.files[0] });
    }

    isValid(){
        if (!this.state.file){
            alert("Arquivo é obrigatório");
            return;
        }
        
        return true;
    }

    async onSubmit(e){
        var that = this;
        e.preventDefault();

        const { file, description } = this.state;

        this.setState({ loading: true });

        let accounts = await web3.eth.getAccounts();
        let account = accounts[0];

        if (this.isValid()){

            uploadIpfs(this.state.file, (hash) => {
                gallery.methods
                    .create(hash, description)
                    .send({from: account}).then(() => {
                        that.setState({ loading: false });
                        that.props.close();
                        events.emit("picture-added", {"1": hash, "2": description});
                    });
            });

            this.setState({ loading: true });
        }
    }

    render() {
        return (
            <Modal dimmer={"blurring"} open={this.props.open} onClose={this.props.close}>
                <Modal.Header>Upload</Modal.Header>
                <Modal.Content>
                    <Form onSubmit={this.onSubmit.bind(this)}>
                        <Form.Field control={Form.Input} label="Imagem" type="file" onChange={this.onChangeFile.bind(this)}/>
                        <Form.Field control={Form.TextArea} label="Descrição" onChange={e => {this.setState({description: e.target.value})}}/>
                        <Form.Field control={Form.Button} primary loading={this.state.loading}>Enviar</Form.Field>
                    </Form>
                </Modal.Content>
            </Modal>
        );
    }
}
import { abi } from '../build/contracts/Gallery.json';
import web3 from '../controllers/web3';

const address = "0x039c0ff0904729372e67a7b0e14efcb47ae9ba37";

export default new web3.eth.Contract(abi, address);

import { abi } from '../build/contracts/HeartToken.json';
import web3 from '../controllers/web3';

const address = "0xf4c936d0b30e86cd80622f7b0c74f90bee08b1ec";

export default new web3.eth.Contract(abi, address);

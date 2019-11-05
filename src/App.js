import React, { Component } from "react";
import Panel from "./Panel";
import AirlineContract from "./airline";
import { AirlineService } from "./airlineService";
import getWeb3 from "./getWeb3";

const converter = (web3) => {
    return (value) => {
        return web3.utils.fromWei(value.toString(), 'ether');
    }
}

export class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            balance: 0,
            account: undefined,
            flights: [],
            customerFlights: [],
            
        };
    }

    async componentDidMount() {
        this.web3 = await getWeb3();
        this.toEther = converter(this.web3);
        this.airline = await AirlineContract(this.web3.currentProvider);
        this.airlineService = new AirlineService(this.airline);
        var account = (await this.web3.eth.getAccounts());
        console.log("cuenta" + account);

        this.web3.currentProvider.publicConfigStore.on('update', async function(event) {
            this.setState({
                account: event.selectedAddress.toLowerCase()
            }, () => {
                this.load();
            });
        }.bind(this));

        this.setState({
            account: account
        },() => {
            this.load();
        });
    }

    async getBalance() {
        let weiBalance = await this.web3.eth.getBalance(this.state.account);
        this.setState({
            balance: this.toEther(weiBalance)
        });
    }

    async getFlights() {
        let flights = await this.airlineService.getFlights();
        this.setState({
           flights 
        });
    }

    async getCustomerFlights() {
        let customerFlights = await this.airlineService.getCustomerFlights(this.state.account);
        this.setState({
            customerFlights
        });
    }

    async buyFlight(flightIndex, flight) {
        console.log(this.state.account)
        await this.airlineService.buyFlight(
            flightIndex, 
            this.state.account.toString(),
            flight.price
        );
    }

    async load() {
        this.getBalance();
        this.getFlights();
        this.getCustomerFlights();
    }

    render() {
        return <React.Fragment>
            <div className="jumbotron">
                <h4 className="display-4">Welcome to the Airline!</h4>
            </div>

            <div className="row">
                <div className="col-sm">
                    <Panel title="Balance">
                        <p><strong>{this.state.account}</strong></p>
                        <span><strong>Balance:</strong> {this.state.balance}</span>
                    </Panel>
                </div>
                <div className="col-sm">
                    <Panel title="Loyalty points - refundable ether">

                    </Panel>
                </div>
            </div>
            <div className="row">
                <div className="col-sm">
                    <Panel title="Available flights">
                        {this.state.flights.map((flight, i) => {
                            return <div key={i}>
                                        <span>{flight.name} - cost: {this.toEther(flight.price)}</span>
                                        <button className="btn btn-sm btn-success text-white"onClick={() => this.buyFlight(i, flight)}>Purchase</button>
                                    </div>
                        })}

                    </Panel>
                </div>
                <div className="col-sm">
                    <Panel title="Your flights">
                        {this.state.customerFlights.map((flight, i) =>{
                            return <div key={i}>
                                {flight.name} - cost: {flight.price}
                            </div>
                        })}
                    </Panel>
                </div>
            </div>
        </React.Fragment>
    }
}
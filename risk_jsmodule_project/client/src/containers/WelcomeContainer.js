import React from 'react'
import GameForm from '../components/GameForm'
import CountryContainer from './CountryContainer'
// import CountryList from '../components/CountryList'
// import CountrySelect from '../components/CountrySelect'
// import CountryDetail from '../components/CountryDetail'




const WelcomeContainer = ({addPlayers}) => {




    return (
        <div className="welcome-container">
            <h1>LITTLE RISK</h1>
            
            <GameForm  addPlayersToState={addPlayers}/>
            <div className="country-container">
                <CountryContainer />
            </div>
            </div>
            
        
    )
}

export default WelcomeContainer

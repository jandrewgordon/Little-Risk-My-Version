import React, {useState, useEffect} from 'react'
import QuantSelector from './QuantSelector';
import BattleSummary from './BattleSummary';
import WinnerBanner from './WinnerBanner';

const PlayerUI = ({currentTerritory, gameState, players, incrementTroops, changeOccupier, updateGameState}) => {

    const [playerTurn, setPlayerTurn] = useState(null);
    const [gameRunning, SetGameRunning] = useState(false);
    const [refinforcements, setReinforcements] = useState(0);
    const [rounds, setRounds] = useState(-1);
    const [targetTerritory, setTargetTerritory] = useState({"territory": null, "isFriendly": false})
    const [quantitySelectorTrigger, setQuantitySelectorTrigger] = useState(false);
    const [winnerTrigger, setWinnerTrigger] = useState(false);
    const [winner, setWinner] = useState(false);
    const [battleSummaryTrigger, setBattleSummaryTrigger] = useState(false);
    const [battleReport, setBattleReport] = useState({});

    useEffect(() => {
        assignTurn();
        SetGameRunning(true);
    }, [])

    useEffect(() => { 
        if(playerTurn){
            calcReinforcements(playerTurn);
            setUIColour(playerTurn);
        }
        // Win condition
        console.log(`ROUND${rounds}`);
        if(rounds > 2){
        let totalTerittories = gameState.GameState.length;
            for(let i=0; i<players.length; i++){
                let playerTerCount = gameState.GameState.filter(t => t.occupier == players[i])
                console.log(`${players.name} controlls ${playerTerCount.length}/${totalTerittories}`)
                if (playerTerCount.length === totalTerittories){
                    setWinner(players[i]);
                    console.log(`${players[i].name} has won!!!!!!`)
                    setWinnerTrigger(true);
                    break;
                }
            }
        }
    }, [playerTurn])

    useEffect(() => {
        setTargetTerritory({"territory": null, "isFriendly": false})
    },[currentTerritory])

    const assignTurn = () => {
        setRounds(rounds+1);
        if(playerTurn === null){
            setPlayerTurn(players[Math.floor(Math.random()*players.length)]);
        }
        else{
            let currentIndex = players.indexOf(playerTurn);
            if(currentIndex+1 >= players.length){
                setPlayerTurn(players[0]);
            }
            else{
                setPlayerTurn(players[currentIndex+1]);
            }
        }
    }


    const calcReinforcements = (activePlayer) => {
            try{
                setReinforcements(Math.floor((gameState.GameState.filter(GameState => GameState.occupier == activePlayer)).length / 5));
                if(refinforcements < 3){ setReinforcements(3) }
            }
            catch (error){
                console.error(error);
                console.log(`Failed to calculate reinforcements for ${activePlayer.name}`)
            }
    }

    const getBorders = (territory) => {
        if (territory !== 'None'){
            return gameState.GameState.filter(GameState => territory.borders.includes(GameState.name))
        }
    }

    const handleTargetTerritory = (id, isFriendly) => {
        setTargetTerritory({
            "territory": gameState.GameState.filter(b => b.id === id)[0], 
            "isFriendly": isFriendly
        });
        setQuantitySelectorTrigger(true);
    }

    const getFriendly = () => {
        let borders = getBorders(currentTerritory);
        let friendlyBorders = borders.filter(border => border.occupier == currentTerritory.occupier)
        let friendlyBorderListItems = null;
        if(currentTerritory.occupier === playerTurn){
            friendlyBorderListItems = friendlyBorders.map(b => <li key={b.id}>
                <div className="friendly-border-list">
                 <button onClick={() => handleTargetTerritory(b.id, true)}>{b.name}</button>
                 </div>
                 </li>)
        }
        else{
            friendlyBorderListItems = friendlyBorders.map(b => <li key={b.id}>{b.name}</li>)
        }
        return (
            <div>
                <ul>
                <li>{friendlyBorderListItems}</li>
                </ul>
            
            </div>
        )
    }
    const getEnemy = () => {
        let borders = getBorders(currentTerritory);
        let enemyBorders = borders.filter(border => border.occupier != currentTerritory.occupier)
        let enemyBorderListItems = null;
        if(currentTerritory.occupier === playerTurn){
            enemyBorderListItems = enemyBorders.map(b => <li key={b.id}>
                <div className="enemy-border-items">
                <button onClick={() => handleTargetTerritory(b.id, false)}>{b.name}</button>
                </div>
                </li>);
        }else{
            enemyBorderListItems = enemyBorders.map(b => <li key={b.id}>{b.name}</li>)
        }
        return (
            <div className="enemy-border-items" >
            <ul>
                <li>{enemyBorderListItems}</li>
            </ul>
            </div>
        )
    }

    const deploy = () => {
        if(playerTurn != currentTerritory.occupier){
            console.log('You cant deploy troops behind enemy lines');
        }
        else{
            if(refinforcements > 0){
                incrementTroops(1, currentTerritory)
                setReinforcements(refinforcements-1);
            }
            else{
                console.log('You have used all your reinforcements');
            }
        }
        
    }

    const commitTroops = (noTroops) => {
        if(targetTerritory.isFriendly){
            // Add/Subtract noTroops
            incrementTroops(-parseInt(noTroops), currentTerritory);
            incrementTroops(parseInt(noTroops), targetTerritory.territory);
        }
        else{
            // Do fight. 
            let attackingTroops = noTroops;
            let defendingTroops = 1;
            if (targetTerritory.territory.troops > 1){
                defendingTroops = 2;
            }
            let rolls = [[],[]];
            for(let i=0; i<attackingTroops; i++){
                rolls[0].push(Math.floor(Math.random() * 7))
            }
            for(let i=0; i<defendingTroops; i++){
                rolls[1].push(Math.floor(Math.random() * 7))
            }

            rolls[0].sort();
            rolls[1].sort();
            rolls[0].reverse();
            rolls[1].reverse();

            let casualties = [0,0];
            
            if(!isNaN(rolls[0][1]) && !isNaN(rolls[1][1])){         //Are both attacker and defender using at least 2 troops?
                if(rolls[1][1] >= rolls[0][1]){
                    // Defender wins
                    incrementTroops(-1, currentTerritory);
                    casualties[0] += 1;
                }
                else{
                    // Attacker wins
                    incrementTroops(-1, targetTerritory.territory)
                    casualties[1] += 1;
                }
            }
            if(rolls[1][0] >= rolls[0][0]){
                // Defender wins
                incrementTroops(-1, currentTerritory);
                casualties[0] += 1;
            }
            else{
                // Attacker wins
                incrementTroops(-1, targetTerritory.territory)
                casualties[1] +=1;
            }
            
            let battleSummary = {
                "attacker": currentTerritory.occupier.name,
                "defender": targetTerritory.territory.occupier.name,
                "attackingRolls": rolls[0].toString(),
                "defendingRolls": rolls[1].toString(),
                "attackingCasualties": casualties[0],
                "defendingCasualties": casualties[1],
                "territoryTaken": false
            }

            if(targetTerritory.territory.troops === 0){
                // If defender is defeated..
                changeOccupier(playerTurn, targetTerritory.territory);
                incrementTroops(1, targetTerritory.territory);
                incrementTroops(-1, currentTerritory);
                battleSummary.territoryTaken = true;
            }

            setBattleReport(battleSummary);
            setBattleSummaryTrigger(true);

        }
    }

    const handleCurrent = () => {
        if (currentTerritory === 'None'){
            return (
                <>
                    <p> select a territory </p>
                    <br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br>
                </>
            )
        }
        else{
            return(
                <>
                <h4>{currentTerritory.name}</h4>
                <p>Current Troops: {currentTerritory.troops}</p>
                <table>
                    <thead>
                        <th>Friendly</th>
                        <th>Enemy</th>
                    </thead>
                    <tbody>
                        <td>{getFriendly()}</td>
                        <td>{getEnemy()}</td>
                    </tbody>
                </table>
                <div className='ui-distribute-refinforcements'>
                <button onClick={deploy}>Deploy Troop</button>
                </div>
                </>
            )
        }
    }

    const setUIColour = function(playerTurn){
        var uiElement = (document.getElementsByClassName("user-interface"))
    

        if(playerTurn == players[0]){
        //     console.log(uiElement[0])
            uiElement[0].setAttribute("style", "border-color: coral")
        //     console.log(uiElement[0])

        }
        if(playerTurn == players[1]){
        //     console.log(uiElement[0])
            uiElement[0].setAttribute("style", "border-color: lightblue")
        //     console.log(uiElement[0])
            
            
        }

    }


    return (
        <>
        <div className='user-interface'>
            <h1>{playerTurn?.name}</h1>
            <div className='ui-reinforcements'>
                <h1>{refinforcements}</h1>
            </div>

            <div className='ui-active-selection'>
                {handleCurrent()}
            </div>

            <div className='ui-end-turn'>
                    <button onClick={assignTurn}>END TURN</button>
            </div>
        </div>
        <div className='input-handler'>
            <QuantSelector trigger={quantitySelectorTrigger} setTrigger={setQuantitySelectorTrigger} target={targetTerritory} commitTroops={commitTroops} currentTerritory={currentTerritory}/>
            <BattleSummary trigger={battleSummaryTrigger} setTrigger={setBattleSummaryTrigger} battleReport={battleReport}/>
            {/* <WinnerBanner trigger={winnerTrigger} setTrigger={setWinnerTrigger} winner={winner}/> */}
        </div>
        </>
    )
}


export default PlayerUI;
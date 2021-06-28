import React,{useState, useEffect} from 'react'
import { VectorMap } from '@south-paw/react-vector-maps';
import usa from '../resources/usa.json'
import GameState from '../resources/game_state.json'
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';

const GameMap = ({players}) => {
  
  
    const [selectedTerritory, setSelectedTerritory] = React.useState('None');
    const [currentTerritoy, setCurrentTerritory] = useState('None'); //Finds game-state equivalent of selectedTerritory
    // new state added to hold data on 'layers' at a high enough level that they can be manipulated.  ID matches that from VectorMap JSON
    const [gameState, setGameState] = useState(null);

    useEffect(() => {
      setGameState({...GameState})
    },[])

    useEffect(() => {
      if(selectedTerritory !== 'None')
        for(let i=0; i<gameState.GameState.length; i++){
          if(selectedTerritory.id === gameState.GameState[i].id){
            setCurrentTerritory(gameState.GameState[i]);
          }
        }
    }, [selectedTerritory])

    useEffect(() => {
      if(gameState){                    
        territoryInit();
      }
  }, [players])


    const territoryInit = () => {
      //There are 49 states, which need to be split amongst players. 
      const noOfPlayers = players.length;
      const noTer = gameState.GameState.length;
      let tempState = gameState;

      for(let i=0; i<noTer; i++){
        let tempTer = {
          'name': gameState.GameState[i].name,
          'id': gameState.GameState[i].id,
          'occupier': players[Math.floor(Math.random()*noOfPlayers)],
          'troops': 0
        };
        tempState.GameState.push(tempTer)
      }
      tempState.GameState.splice(0, noTer);
      setGameState(tempState);
      troopsInit();
    }

    const troopsInit = () => {
      const initalTroopCount = 80;
      const troopsEach = Math.floor(initalTroopCount/players.length);
      const territoryByPlayer = [];
      for(let i=0; i<players.length; i++){
        let tempTerArray = gameState.GameState.filter(GameState => GameState.occupier === players[i]);
        territoryByPlayer.push(tempTerArray);
      }
      for(let i=0; i<territoryByPlayer.length; i++){                        // For players
        for(let n=0; n<territoryByPlayer[i].length; n++){                   // For players' territories
            territoryByPlayer[i][n].troops = 1;                                // Put one troop in each territory
        }
        let troopsLeft = troopsEach-territoryByPlayer[i].length;
        while (troopsLeft > 0){                                              // Randomly distribute the remainder.
          territoryByPlayer[i][Math.floor(Math.random()*territoryByPlayer[i].length)].troops += 1;
          troopsLeft = troopsLeft - 1;
        }
      }
      let distributionDone = gameState;
      territoryByPlayer.forEach(array => distributionDone.GameState.concat(array))
      setGameState(distributionDone);
    }

  
    const layerProps = {
      onClick: ({ target }) => {
        setSelectedTerritory({
          "id": target.attributes.id.value
        })
      },
    };



    return (
      <div>
        <VectorMap {...usa} layerProps={layerProps} className='vector_map'/>
          <div className='selected-terittory-data'>
            <h5>Selected: {currentTerritoy.territory}</h5>
            <p>occupier: {currentTerritoy.occupier}</p>
            <p>troops: {currentTerritoy.troops}</p>
          </div>
      </div>
  );
}


export default GameMap;
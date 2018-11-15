import React, { Component } from 'react'
import './App.css'
import Home from './Home'
import Map from './Map'
import { Route } from 'react-router-dom'

class App extends Component {

  state = {
    allCafes: [], //Store the Raw Data coming from fourSquare
    allMarkers: [], //Store the Markers Data
    mapCenter: {
      name: "",
      lat: "",
      lng: ""
      }
}

  /*** CALLING APIS ***/
    componentWillMount(){
        this.renderSearch()  // Call Gmap
    }

    componentDidUpdate(){
      this.activateGMap()
    }


/********************* GOOGLE MAP *********************/
    /** AUTOCOMPLETE**/
    // render Autocomplete Search
    renderSearch = () => {
      loadGMap("https://maps.googleapis.com/maps/api/js?key=AIzaSyDS0pzpMW_qNo6xMb8d0I69zukaOsC0Lx0&libraries=places&callback=activateGMap")
      window.activateGMap = this.activateGMap
      // window.activatePlaceSearch = this.activatePlaceSearch
    }

    // Use Autocomplete to generate next map center
    activateGMap = () => {
      if(window.location.href.indexOf("map") > -1){
        console.log("MAP");
      } else {
        let input = document.querySelector(".search-café")
        const options = {types: ['(cities)']};
        let autocomplete = new window.google.maps.places.Autocomplete(input, options)
        autocomplete.addListener('place_changed', () => {
              let place = autocomplete.getPlace()
              let lat = place.geometry.location.lat()
              let lng = place.geometry.location.lng()
              console.log("lat ", lat)
              console.log("lng ", lng)
              console.log("place ", place)
              this.getMapCenter(place.formatted_address, lat, lng)
              this.activate4Square(lat, lng) // Call 4square
            })

        console.log("Home");
      }
    }

    getMapCenter(place, lat, lng){
      let updatedMapCenter = {
      name: place,
      lat: lat,
      lng: lng
      }
      this.setState({
        mapCenter: updatedMapCenter
      })
    }

  /** INIT MAP**/
    //Create Markers
    createMarkers(cafes){
      let allMarkers = []
        cafes.map( cafe => {
          let marker = {
            id: '',
            name: '',
            address: '',
            city:'',
            postalCode: '',
            state: '',
            country: '',
            location: {
              lat: 0,
              lng: 0
            }
          }
        marker.id = cafe.venue.id
        marker.name = cafe.venue.name
        marker.address = cafe.venue.location.address
        marker.city = cafe.venue.location.city
        marker.postalCode = cafe.venue.location.postalCode
        marker.state = cafe.venue.location.state
        marker.country = cafe.venue.location.country
        marker.location.lat = cafe.venue.location.lat
        marker.location.lng = cafe.venue.location.lng
        return allMarkers.push(marker)
      })
      this.setState({ allMarkers })
    }

/********************* FOURSQUARE *********************/
    activate4Square = (lat, lng) => {
      // Add the lat and lng provided by autocomplete to 4Square url
      let url = `https://api.foursquare.com/v2/venues/explore?client_id=FBFR4MRSN5YJ34CQKWAN0RWG55X41LX0ILOLM5JW52T0ZMKP&client_secret=2NPKFK05BW3WOBENMIWPRPFKQEDBWLNGXX1ANW5YUFQ1QHLD&v=20180323&limit=100&ll=${lat},${lng}&radius=1500&query=Café`
      // Search For Cafes
      fetch(url)
        .then(places=> places.json())
        .then(parsedJSON => {
          //Get allCafes
          this.setState({ allCafes: parsedJSON.response.groups[0].items })
          //Get allMarkers
          this.createMarkers(this.state.allCafes)
        })
        .catch(error => console.log("oops", error))
    }

/********************* Render *********************/
  render() {
    console.log("The State", this.state);
    return (
      <div className="main">
        <Route exact path="/"
               render={() => (
                 <Home allCafes={this.state.allCafes}/>
               )}
        />

        <Route exact path="/map" render={() => (
            <div className="map-screen">
              <Map />
            </div>
            )}
        />
      </div>
    )
  }
}

// Function to Create Gmap Script Tag
function loadGMap (url){
  let index = window.document.getElementsByTagName("script")[0]
  let script = window.document.createElement("script")
  script.className = "GMap"
  script.src = url
  script.async = true
  script.defer = true
  index.parentNode.insertBefore(script, index)
}

export default App;

import React, {useState,useEffect} from 'react'
import axios from 'axios';
import places from 'places.js'
import './weather.css';
import DailyHourlyCondition from './DailyHourlyCondition';

function Weather() {

    const [location, setlocation] = useState({
       lat : 0,
       long : 0,
       name : ''
    });

    const API_key =  process.env.REACT_APP_OPENWEATHER_API_KEY;

    const [currentTemperature, setCurrentTemperature] = useState({
        actual : '',
        feels : '',
        condition : '',
        icon : ''
    })

    const [type, setType] = useState('current')

    const [dailyTemperatures, setDailyTemperatures] = useState([])
    const [hourlyTemperatures, setHourlyTemperatures] = useState([])

    const[isLoading, setIsLoading] = useState(false);
    const[invalidLocation, setInvalidLocation] = useState(false);


    useEffect(()=>{

        // Using session storage in order to persist selected location value across browser refresh
        // If user selects any location from dropdown then that location will be set in the session storage
        // If user is visiting for the first time then location permission will be asked by GeoLocation API,
        // if permission is given then geolocation will set location value in session storage
        // If user selects any value Algolia places dropdown then that value will be set in session storage as well as component's state
        // After browser refresh happens, first session storage value will be checked and corresponding location value will be set if its not empty
        //  else geolocation API will fetch the user's location
    
        if(!sessionStorage.getItem("locationChanged") || !sessionStorage.getItem("location") || !JSON.parse(sessionStorage.getItem('locationChanged')) ){
            geoFindMe()
        }

        const prelocation = JSON.parse(sessionStorage.getItem("location")) || {
                lat : 0,
                long : 0,
                name : 'none'
        };
           
            
        setlocation(prelocation)
        let $address = document.querySelector('#address-value')
        $address.textContent= prelocation.name
        
        
    },[]);


    // Below useEffect hook will be executed everytime location object is changed
     
    useEffect(() => {

        // Fetching data from OpenWeather API
        if(location.name == 'none' && location == {}){
            setInvalidLocation(true)
        }
        else{
            fetchdata()
        }
    
        // Using Algolia places API for searching cities
        let placesAutocomplete = places({
            appId: 'plD06YWGSBA0',
            apiKey: process.env.REACT_APP_ALGOLIA_API_KEY,
            container: document.querySelector('#city'),
          
          }).configure({
            type: 'city',
            aroundLatLngViaIP: false,
            
          });

          let $address = document.querySelector('#address-value')
          

        //   if user enters wrong or invalid character in search box below function will be executed
          placesAutocomplete.on('suggestions', (e)=>{
              
              if(e.suggestions.length == 0){
                setlocation({
                    lat : 0,
                    long : 0,
                    name : 'none'
                });

                sessionStorage.setItem("locationChanged", false)
                setInvalidLocation(true)
                $address.textContent = 'none'
              }

              else{
                  setInvalidLocation(false)
              }
          })


        //   If user selects some location from dropdown then below code will be executed
          placesAutocomplete.on('change', (e) => {

            $address.textContent = e.suggestion.value
        
            setlocation({
                lat : e.suggestion.latlng.lat,
                long : e.suggestion.latlng.lng,
                name : `${e.suggestion.name}, ${e.suggestion.country}`
            });

            sessionStorage.setItem("locationChanged", true)
            setInvalidLocation(false)

          });

        placesAutocomplete.on('clear', function() {
            $address.textContent = location.name || 'none';
            if(location.name == 'none'){
                sessionStorage.setItem("locationChanged", false)
            }
        });

        sessionStorage.setItem("location", JSON.stringify(location))
        
    }

, [location.lat, location.long,location.name,invalidLocation])


   

    // For finding user's current location using Geolocation API
    const geoFindMe = () => {
        let $address = document.querySelector('#address-value')
        function success(position) {

            const latitude  = position.coords.latitude;
            const longitude = position.coords.longitude;

            setInvalidLocation(false);
            
            // Below API is used in order to convert user's current location longitude and latitute values into meaningful location
            axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
            .then(response=>{

                const locality = response.data.localityInfo.administrative.map(info=>(info.name));
                const locName = locality.slice(0,3).reverse().join(", ");
                setlocation({
                    lat: latitude,
                    long : longitude,
                    name : locName
                });

                sessionStorage.setItem("location", JSON.stringify(location));
                sessionStorage.setItem("locationChanged", true)

                if($address){
                    $address.textContent = locName != '' ? locName : 'none';
                }

               
        
            }). catch (error => {
                setInvalidLocation(true);
                console.log(error);
                $address.textContent = 'none';
                setLocation({});
        
            })
        }
        
            function error() {
                console.log('error');
                setInvalidLocation(true);
                $address.textContent = 'none'
                setlocation({
                    lat:0,
                    long:0,
                    name:'none'
                })
                sessionStorage.setItem("location", JSON.stringify(location));

                //alert('Unable to retrieve your location');

            }
        
            if(!navigator.geolocation) {
                setInvalidLocation(true);
                $address.textContent = 'none'
                setlocation({
                    lat:0,
                    long:0,
                    name:'none'
                })
                sessionStorage.setItem("location", JSON.stringify(location));

                
                // alert('Geolocation is not supported by your browser');

            } else {
                // alert('locating...')
                setIsLoading(true);
                navigator.geolocation.getCurrentPosition(success, error);
                setIsLoading(false);
            }
        
    }

  

    //   For fetching weather data from OpenWeather one call API
    const fetchdata = () => {
        setIsLoading(true)
        axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${location.lat}&lon=${location.long}&units=metric&appid=${API_key}`)
        .then(
            (response)=>
            {   
                setIsLoading(false);

                // Setting current temperature object values
            
                setCurrentTemperature({
                    actual : Math.round(response.data.current.temp),
                    feels : Math.round(response.data.current.feels_like),
                    condition : response.data.current.weather[0].main,
                    description : response.data.current.weather[0].description,
                    icon : response.data.current.weather[0].icon
                })

                // Setting daily temperature values as an array

                const dailyArr = response.data.daily.map(ele =>(
                    {
                    timestamp : ele.dt,
                    minTemp : ele.temp.min,
                    maxTemp : ele.temp.max,
                    condition : ele.weather[0].main,
                    description : ele.weather[0].description,
                    icon : ele.weather[0].icon
                    }
                ));
                setDailyTemperatures(dailyArr);

                // Setting hourly temperature values as an array

                const hourlyArr = response.data.hourly.map(ele =>(
                    {
                    timestamp : ele.dt,
                    minTemp : ele.temp.min,
                    maxTemp : ele.temp.max,
                    condition : ele.weather[0].main,
                    description : ele.weather[0].description,
                    icon : ele.weather[0].icon
                    }
                ));

                setHourlyTemperatures(hourlyArr)
            
        }).catch (error => {
                 setLoading(falae);

                setInvalidLocation(true);

                console.log(error);

                $address.textContent = 'none';

                setLocation({});
            })
       }
    

    // For toggling between current, daily and houly temperatures
    const changeType = (e) => {
        setType(e.target.value);
    }

    return (

        <div className="container">

            <div className="container__input-container">
                <input type="search" id="city" className="form-control" placeholder="In which city do you live?" />
                <p>Selected Location: <strong id="address-value">None</strong></p>
            </div>

            { invalidLocation ? <h2>Weather information can't be retrieved. Please select a valid location or allow the location access</h2> :
            (  
            <> 
            <div className="container__selection">
                <button value="current" className={type == 'current' ? 'selectedButton' : null} onClick={changeType}>Current Weather</button>
                <button value="daily" className={ type == 'daily' ? 'selectedButton' : ""} onClick={changeType}>Daily Weather</button>
                <button value="hourly" className={type == 'hourly' ? 'selectedButton' : ""} onClick={changeType}>Hourly Weather</button>
            </div>

            <p>Selected type: <strong>{type}</strong></p>
        
            <div className="container__main">
                { isLoading ?  
                    ( 
                        <div className="main__spin"></div>
                    ) : 
                    type == 'current' ?
                    (
                        <div className="main__current">
                            <div className="current__temp-info">
                                <div className="temp-info__actual-temp">{ currentTemperature.actual}°C</div>
                                <div className="temp-info__feels-temp">
                                        Feels like { currentTemperature.feels}°C
                                </div>
                            </div>

                            <div className="current__condition-info">
                                <div className="condition-info__condition">
                                    <h3>{ currentTemperature.condition}</h3>
                                </div>
                                <div className="condition-info__location">
                                    <p>{location.name}</p>
                                </div>
                            </div>

                            <div className="current__icon-info">
                                <div>
                                    <img src={`http://openweathermap.org/img/wn/${currentTemperature.icon}@2x.png`} width="100" height="100"/>
                                </div>
                            </div>

                        </div>
                        
                    ) 

                    : <DailyHourlyCondition 
                        type = {type}
                        dailyTemperatures={dailyTemperatures} 
                        hourlyTemperatures={hourlyTemperatures}/>
                        
                    }
                
            </div>
            </>
            )}
        </div>
        
    )
}

export default Weather

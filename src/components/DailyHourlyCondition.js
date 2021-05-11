import React from 'react'
import moment from 'moment'
import './dailyHourlyCondition.css'

function DailyHourlyCondition({dailyTemperatures, hourlyTemperatures,type}) {

    const tempArr = type == 'daily' ? dailyTemperatures : hourlyTemperatures;
    
    // Converting timestamp into valid day of the week value
    const toDayOfWeek = (timestamp) => {
        // 1. Using moment
        let daySeconds = moment.unix(timestamp);
         return daySeconds.format('dddd').toUpperCase();

        //  2. Using Date class of JavaScript
        // const newDate = new Date(timestamp*1000)
        // const days = ['SUN','MON','TUE','WED','THU','FRI','SAT']
        // return days[newDate.getDay()]
        }

    
    
    // Converting timestamp into Hour of the day value
    const toHourOfDay = (timestamp) => {
        // 1. Using moment
        let timestampSeconds = moment.unix(timestamp); //seconds
        return timestampSeconds.format('ddd MMM Do, h:mm:ss a');

        // 2. Using Date class of JavaScript
        // var hours = newDate.getHours();
        // var mins = "0" + newDate.getMinutes();
        // var seconds = "0" + newDate.getSeconds();
        // var formattedTime = hours + ':' + mins.substr(-2) + ':' + seconds.substr(-2);
    }


    return (
    
            <div className="content">
                {  tempArr.length > 0 && tempArr.map((element) => (

                    <div key={element.timestamp} className="content__row">
                        <div className="row__col-1">
                            {type == 'daily' ? toDayOfWeek(element.timestamp) || 'Mon' : toHourOfDay(element.timestamp) || 'Tuesday'}
                        </div>

                        <div className="row__col-2">
                            <img src={`http://openweathermap.org/img/wn/${element.icon}@2x.png`} width="100" height="100"/>
                            <h2>{element.condition}</h2>
                            <p>{element.description}</p>
                        </div>

                        <div className="row__col-3">
                            <div>{element.minTemp || 34}°C</div>
                            <div>{element.maxTemp || 34}°C</div>
                        </div>
                    </div>

                )) }

            </div>
        
    )
}

export default DailyHourlyCondition

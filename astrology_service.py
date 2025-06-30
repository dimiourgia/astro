#!/usr/bin/env python3.11
import sys
import json
import traceback
from datetime import datetime
import pytz

try:
    from flatlib.datetime import Datetime
    from flatlib.geopos import GeoPos
    from flatlib.chart import Chart
    from flatlib import const
    from geopy.geocoders import Nominatim
except ImportError as e:
    print(json.dumps({"error": f"Required libraries not installed: {e}"}))
    sys.exit(1)

def get_coordinates(location):
    """Get latitude and longitude for a location"""
    try:
        geolocator = Nominatim(user_agent="astrology_app")
        location_data = geolocator.geocode(location)
        if location_data:
            return location_data.latitude, location_data.longitude
        else:
            # Default to London if location not found
            return 51.5074, -0.1278
    except Exception:
        # Default to London if geocoding fails
        return 51.5074, -0.1278

def calculate_birth_chart(date_str, time_str, location_str):
    """Calculate Vedic birth chart using flatlib"""
    try:
        # Parse date and time
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        time_obj = datetime.strptime(time_str, "%H:%M")
        
        # Combine date and time
        birth_datetime = datetime.combine(date_obj.date(), time_obj.time())
        
        # Get coordinates
        lat, lon = get_coordinates(location_str)
        
        # Create flatlib objects
        dt = Datetime(birth_datetime.strftime("%Y/%m/%d"), birth_datetime.strftime("%H:%M"), "+00:00")
        pos = GeoPos(lat, lon)
        
        # Generate chart
        chart = Chart(dt, pos, hsys=const.HOUSES_WHOLE_SIGN, IDs=const.LIST_SEVEN_PLANETS)
        
        # Extract planetary positions
        planets = {}
        planet_list = [const.SUN, const.MOON, const.MERCURY, const.VENUS, 
                      const.MARS, const.JUPITER, const.SATURN]
        
        for planet_id in planet_list:
            planet = chart.get(planet_id)
            
            # Get house position for the planet
            house_num = 1
            for h_id in const.LIST_HOUSES:
                house = chart.getHouse(h_id)
                if house.hasObject(planet):
                    house_num = get_house_number(h_id)
                    break
            
            planets[planet.id] = {
                "name": planet.id,
                "sign": planet.sign,
                "house": house_num,
                "longitude": float(planet.lon),
                "latitude": float(planet.lat) if hasattr(planet, 'lat') else 0,
                "sign_name": get_sign_name(planet.sign),
                "house_number": house_num
            }
        
        # Extract house positions
        houses = {}
        for i, house_id in enumerate(const.LIST_HOUSES, 1):
            house = chart.getHouse(house_id)
            houses[str(i)] = {
                "sign": house.sign,
                "sign_name": get_sign_name(house.sign),
                "cusp": float(house.lon)
            }
        
        # Calculate aspects (simplified)
        aspects = calculate_aspects(planets)
        
        # Prepare result
        result = {
            "chartData": {
                "date": date_str,
                "time": time_str,
                "location": location_str,
                "latitude": lat,
                "longitude": lon
            },
            "planets": planets,
            "houses": houses,
            "aspects": aspects
        }
        
        return result
        
    except Exception as e:
        return {"error": f"Chart calculation failed: {str(e)}", "traceback": traceback.format_exc()}

def get_sign_name(sign_id):
    """Convert sign ID to name"""
    sign_names = {
        const.ARIES: "Aries",
        const.TAURUS: "Taurus", 
        const.GEMINI: "Gemini",
        const.CANCER: "Cancer",
        const.LEO: "Leo",
        const.VIRGO: "Virgo",
        const.LIBRA: "Libra",
        const.SCORPIO: "Scorpio",
        const.SAGITTARIUS: "Sagittarius",
        const.CAPRICORN: "Capricorn",
        const.AQUARIUS: "Aquarius",
        const.PISCES: "Pisces"
    }
    return sign_names.get(sign_id, "Unknown")

def get_house_number(house_id):
    """Convert house ID to number"""
    house_numbers = {
        const.HOUSE1: 1, const.HOUSE2: 2, const.HOUSE3: 3,
        const.HOUSE4: 4, const.HOUSE5: 5, const.HOUSE6: 6,
        const.HOUSE7: 7, const.HOUSE8: 8, const.HOUSE9: 9,
        const.HOUSE10: 10, const.HOUSE11: 11, const.HOUSE12: 12
    }
    return house_numbers.get(house_id, 1)

def calculate_aspects(planets):
    """Calculate major aspects between planets"""
    aspects = {}
    planet_keys = list(planets.keys())
    
    for i, planet1 in enumerate(planet_keys):
        for planet2 in planet_keys[i+1:]:
            lon1 = planets[planet1]["longitude"]
            lon2 = planets[planet2]["longitude"]
            
            # Calculate angular distance
            angle = abs(lon1 - lon2)
            if angle > 180:
                angle = 360 - angle
            
            # Check for major aspects (within 8 degree orb)
            aspect_type = None
            if abs(angle - 0) <= 8:
                aspect_type = "Conjunction"
            elif abs(angle - 60) <= 6:
                aspect_type = "Sextile"
            elif abs(angle - 90) <= 8:
                aspect_type = "Square"
            elif abs(angle - 120) <= 8:
                aspect_type = "Trine"
            elif abs(angle - 180) <= 8:
                aspect_type = "Opposition"
            
            if aspect_type:
                key = f"{planet1}_{planet2}"
                aspects[key] = {
                    "planet1": planet1,
                    "planet2": planet2,
                    "type": aspect_type,
                    "angle": round(angle, 2)
                }
    
    return aspects

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print(json.dumps({"error": "Usage: python astrology_service.py <date> <time> <location>"}))
        sys.exit(1)
    
    date_str = sys.argv[1]
    time_str = sys.argv[2] 
    location_str = sys.argv[3]
    
    result = calculate_birth_chart(date_str, time_str, location_str)
    print(json.dumps(result, indent=2))

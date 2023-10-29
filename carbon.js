/* 
Calcualte the carbon emission based on the distance travel
return grams per passenger kilometer
 */
export function carbonCal(transportation, distance) {
    if(transportation === "Airplane") {
        //Grams per passenger kilometer * kilometers travel
        return 0.246 * (distance/1000);
    }

    if(transportation === "Car") {
        return 0.17 * (distance/1000);
    }
}

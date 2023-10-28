export function carbonCal(transportation, distance) {
    if(transportation == "plane") {
        //Grams per passenger kilometer * kilometers travel
        return 246 * distance;
    }

    if(transportation == "car") {
        return 170 * distance;
    }
}

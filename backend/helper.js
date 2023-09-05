/**
 * Keys in the 'updateFields' object are field names, and the values are the new
 * field values to be updated in a database.  The field names are added to a 
 * string in 'sqlFieldString' along with a placeholder and the values are added to 'values'
 * @param {*} updateFields A list of database fields that need updating
 * @param {*} pretermined an array of pre-determined (hardcoded) database fields
 *  to be included in the UPDATE request.  This allows for placeholder variables to be used
 *  with more than one clause, ie. the Set clause and the Where clause.
 *  One clause can have dynamically determined fields (sqlFieldString), while other clauses 
 *  can have pre-determined fields that are hardcoded in the SQL statement.
 */
function patchPrep(updateFields, pretermined){
    const sqlFields = [];
    const values = pretermined? pretermined : [];
    let placeHolderNum = values.length + 1;
    for(const key in updateFields){
        const value = updateFields[key];
        //if (value){
            sqlFields.push(`${key} = $${placeHolderNum}`);
            values.push(value);
            placeHolderNum++;
        //}         
    }
    const sqlFieldString = sqlFields.join();
    return [sqlFieldString, values];
}

module.exports = {patchPrep};
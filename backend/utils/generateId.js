const generateClientId=()=>{
  const random=Math.floor(10000000+Math.random()*90000000)
  return `C${random}`
}

const generateBoId=(dpType,clientId,dpId)=>{
  if(dpType=="CDSL")
  {
    return `${dpId}${clientId.replace('C','')}`
  }
  else if(dpType=='NSDL')
  {
    return `IN${dpId}${clientId.replace('C','')}`
  }
  else
  {
    throw new Error("Invalid DP type")
  }
}
module.exports={generateClientId,generateBoId}
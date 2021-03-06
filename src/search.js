//apikey 저장 위치
const apikey = "RGAPI-a60c9f12-8e05-4c43-afc8-7852fef7e305";

//SUMMONER By userNickName
const getUserId = (nickname) => {
  const GetID_url = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${nickname}?api_key=${apikey}`;
  const response = fetch(GetID_url);
  return response.then((res) => res.json());
};

const getRanked = async (userID) => {
  const getRankUrl = `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${userID}?api_key=${apikey}`;
  const response = await fetch(getRankUrl).then((res) => res.json());
  //데이터가 있을경우 queueType만 한글로 변경 데이터가 없을 경우 unrank 반환
  if (response.length) {
    response[0].queueType = "솔로랭크";
    response[1].queueType = "자유랭크";
    return response;
  } else {
    //랭크 데이터가 없을 경우 들어가는 객체
    const unrank = [
      { queueType: "솔로랭크", tier: "UNRANK", rank: "" },
      { queueType: "자유랭크", tier: "UNRANK", rank: "" },
    ];
    return unrank;
  }
};
//매치 데이터 중 필요한 데이터만 추출하는 함수
const matchExtract = (matchObject, name) => {
  const participantsData = matchObject
    .map((data) => data.info.participants)
    .flat();
  const filterData = participantsData.filter((data) => {
    return data.summonerName === name ? true : false;
  });
  return filterData;
};

const getMatchid = (puuid) => {
  //매치 아이디 획득 및 반환
  const getMatchidurl = `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?type=ranked&start=0&count=6&api_key=${apikey}`;
  const response = fetch(getMatchidurl);
  return response.then((res) => res.json());
};

const getMatchvalue = async (puuid, name) => {
  const matchId = await getMatchid(puuid);
  //반환된 매치 아이디를 통해 매치의 자세한 정보 획득
  const requests = matchId.map((matchId) =>
    fetch(
      `https://asia.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${apikey}`
    )
  );
  //json타입 변환
  const response = await Promise.all(requests).then((responses) =>
    Promise.all(responses.map((res) => res.json()))
  );
  //필요한 데이터 추출
  const matchValue = matchExtract(response, name);
  return matchValue;
};

const getChampionValue = async (userid) => {
  const getChampionurl = `https://kr.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${userid}?api_key=${apikey}`;
  const response = await fetch(getChampionurl).then((res) => res.json());
  return response.slice(0, 6);
  //return response.then((res) => res.json());
};

const getUservalue = async (nickname) => {
  try {
    //user 정보 획득 -> 다른 정보를 얻기위한 데이터
    const userId = await getUserId(nickname);
    //user 랭크 정보 획득
    const userRank = await getRanked(userId.id);
    //user 챔피언 정보 획득
    const userChampion = await getChampionValue(userId.id);
    // user match 정보 획득
    const matchValue = await getMatchvalue(userId.puuid, userId.name);
    console.log(matchValue);
    //console.log(matchValue);
    return [userId, userChampion, userRank, matchValue];
  } catch (e) {
    console.log(e);
  }
};

export { getUservalue };

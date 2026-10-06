import React from 'react'
import HeroSection from '../../Components/HeroSection/HeroSection'
import HomeBook from '../../Components/HomeBook/HomeBook'
import TopBook from '../../Components/TopBook/TopBook'
import BookleBook from '../../Components/BookleBook/BookleBook'
import RatingBook from '../../Components/RatingBook/RatingBook'
import TopSelling from '../../Components/TopSelling/TopSelling'
import HomeReview from '../../Components/HomeReview/HomeReview'
import HomeAuthor from '../../Components/HomeAuthor/HomeAuthor'
import HomeNews from '../../Components/HomeNews/HomeNews'

const Home = () => {
  return (
    <div>
      <HeroSection/>
      <HomeBook/>
      <TopBook/>
      <BookleBook/>
      <RatingBook/>
      <TopSelling/>
      <HomeReview/>
      <HomeAuthor/>
      <HomeNews/>
    </div>
  )
}

export default Home
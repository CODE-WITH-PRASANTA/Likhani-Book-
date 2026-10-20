import React from 'react'
import HeroSection from '../../Components/HeroSection/HeroSection'
import HomeBook from '../../Components/HomeBook/HomeBook'
import TopBook from '../../Components/TopBook/TopBook'
import BookleBook from '../../Components/BookleBook/BookleBook'
import HomeReview from '../../Components/HomeReview/HomeReview'
import HomeNews from '../../Components/HomeNews/HomeNews'

const Home = () => {
  return (
    <div>
      <HeroSection/>
      <HomeBook/>
      <TopBook/>
      <BookleBook/>
      <HomeReview/>
      <HomeNews/>
    </div>
  )
}

export default Home
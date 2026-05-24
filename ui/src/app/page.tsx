import { skills, categories } from '@/generated/skills-manifest'
import { HomeClient } from '@/components/home/home-client'

export default function Home() {
  return <HomeClient skills={skills} categories={categories} />
}

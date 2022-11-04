export interface CarouselEntity {
  id: string
  key: string
  description: string
  content: string
  jsonContent?: CarouselItemModel[]
  creationDate: string | Date
}

export interface CarouselItemModel {
  id?: string
  title?: string
  content?: string
  imgUrl: string
  status?: string
}

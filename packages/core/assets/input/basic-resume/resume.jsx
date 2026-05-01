import { Text, View } from '@react-pdf/renderer'
import React from 'react'
// import { Emphasis } from '../../../src/elements/emphasis'
import { H1, H2, H3, H4, H5, H6 } from '../../../src/elements/heading'
import { LinkComponent } from '../../../src/elements/link'
import { ListItem, UL } from '../../../src/elements/list'
import { Paragraph } from '../../../src/elements/paragraph'
import { Strong } from '../../../src/elements/strong'

export function Resume() {
  return (
    <View>
      <H1>Resume Example</H1>
      <H2>Resume Example</H2>
      <H3>Resume Example</H3>
      <H4>Resume Example</H4>
      <H5>Resume Example</H5>
      <H6>Resume Example</H6>

      <Paragraph>
        This is a resume written in MDX format <Strong>Strong text</Strong>.
      </Paragraph>

      <Paragraph>
        This is a resume written in MDX format. with link to{' '}
        <LinkComponent href="https://example.com">example</LinkComponent>
      </Paragraph>

      <UL>
        <ListItem>Item 1</ListItem>
        <ListItem>Item 2</ListItem>
        <ListItem>
          Item 3
          <UL>
            <ListItem>Item 1</ListItem>
            <ListItem>Item 2</ListItem>
            <ListItem>Item 3</ListItem>
          </UL>
        </ListItem>
      </UL>
    </View>
  )
}

export function ResumeSkillItem({ category, skills }) {
  return (
    <View
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <H5>{category}</H5>
      <Paragraph>{skills.join(', ')}</Paragraph>
    </View>
  )
}

export function ResumeExperience({ title, location, date, description, children }) {
  return (
    <View>
      <View>
        <View
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <H4>{title}</H4>
          <Text>{location}</Text>
        </View>
        <View
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text>{description}</Text>
          <Text>{date}</Text>
        </View>
      </View>
      <View>{children}</View>
    </View>
  )
}

import React from 'react'
import StackGrid from 'react-stack-grid'
import _get from 'lodash/get'

import { getCleanText } from '~/utils'
import Card from '~/components/Card'
import Spinner from '~/assets/icons/spinner.svg'
import styles from './Msgs.css'

const Msgs = ({ msgs, openModal }) => (
  <div className={styles.wrapper}>
    <div>{msgs.length === 0 && <Spinner />}</div>
    <StackGrid columnWidth={340} gutterWidth={40} gutterHeight={20}>
      {msgs &&
        msgs.map(msg => (
          <Card
            key={msg._id}
            _id={msg._id}
            onCardClick={openModal}
            createdDate={msg.created_date}
            text={getCleanText(msg.raw.caption || msg.raw.text)}
            img={_get(msg, ['preview', 'mercury', 'lead_image_url'], '')}
            tags={msg.tags}
          />
        ))}
    </StackGrid>
  </div>
)

export default Msgs

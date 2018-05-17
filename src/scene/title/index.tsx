import * as React from 'react'
import { connect } from 'react-redux'
import { RootState} from '@/declare'

interface StateProps {
  show: boolean
}

type Props = StateProps

const title = (props: Props) => {
  if (!props.show) return null
  return <div>
    <h2>title</h2>
  </div>
}

const mapStateToProps = (state: RootState): Props => {
  return {
    show: true,
  }
}

export default connect(mapStateToProps)(title)
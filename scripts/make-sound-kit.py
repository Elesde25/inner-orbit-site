"""IO-004: original deterministic synthesis; no recordings, samples, or external services."""
import math, random, struct, wave, json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'dist/assets/audio'
RATE=24000

def tone_mix(notes,duration):
    samples=[0.0]*int(RATE*duration)
    for offset,freq in notes:
        for i in range(int(offset*RATE),len(samples)):
            t=i/RATE-offset
            env=min(1,t/.025)*math.exp(-t*2.9)
            samples[i]+=env*(math.sin(2*math.pi*freq*t)+.22*math.sin(2*math.pi*freq*2.003*t)+.08*math.sin(2*math.pi*freq*3.01*t))
    return samples

def whoosh():
    rng=random.Random(4004);result=[];smooth=0.;phase=0.;duration=1.65
    for i in range(int(RATE*duration)):
        t=i/RATE;u=t/duration;smooth=.91*smooth+.09*rng.uniform(-1,1)
        phase+=2*math.pi*(110+400*u*u)/RATE
        result.append(math.sin(math.pi*u)**2*(smooth*.85+math.sin(phase)*.055))
    return result

sounds={'realm-travel':whoosh(),'gateway-arrival':tone_mix([(0,261.63),(.16,392),(.32,523.25)],1.9),'milestone-light':tone_mix([(0,523.25),(.12,659.25),(.24,783.99),(.4,1046.5),(.58,1318.51)],2.2)}
report={}
for name,x in sounds.items():
    # Consistent short-cue RMS with -9 dBFS peak ceiling; fade to exact silence at both edges.
    rms=math.sqrt(sum(v*v for v in x)/len(x));scale=min(.09/rms,.3548/max(map(abs,x)))
    for i in range(len(x)):
        fade=min(1,i/(RATE*.015),(len(x)-1-i)/(RATE*.12))
        x[i]*=max(0,fade)*scale
    data=struct.pack('<'+'h'*len(x),*(round(v*32767) for v in x))
    with wave.open(str(OUT/(name+'.wav')),'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(RATE);w.writeframes(data)
    peak=max(map(abs,x));rms=math.sqrt(sum(v*v for v in x)/len(x))
    report[name]={'duration_seconds':len(x)/RATE,'peak_dbfs':round(20*math.log10(peak),2),'rms_dbfs':round(20*math.log10(rms),2),'bytes':len(data)+44}
(ROOT/'verification/sound-kit').mkdir(parents=True,exist_ok=True)
(ROOT/'verification/sound-kit/measurements.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
